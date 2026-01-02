const { v4: uuidv4 } = require('uuid');
const fs = require("fs-extra");
const tmp = require('tmp');
const path = require('path');
const { spawn, exec } = require('child_process');
const logger = require("../../scripts/Logging")
const config = require("../../config.js")

/** Takes code (as string) and all files which needed to render code and after it renders python code. Renders code until input, 
 * then returns current output and starts waiting for input.
 * Or if there is no inputs then compeltes code sens output and closes container.
 * Container automaticly closes after 1 minute. If class died the container automaticly deletes itself after 5 minutes.
 */
class PythonRender {
    constructor(python_code, extraFiles = []) {
        this.PYTHON_VERSION = config["PYTHON_VERSION"];
        this.id = uuidv4();
        this.tempDir = tmp.dirSync({ unsafeCleanup: true, mode: 0o755 });
        this.python_code = this.addTemplate(python_code);
        this.extraFiles = extraFiles;
        this.containerName = `safe-python-${this.id}`;
        this.output = "";
        this.waitingForInput = false;
        this.inputs = [];
        this.inputIndex = 0;
        this.child = null;
        this.autoCleanupTimeout = setTimeout(async () => {
            try {
                await this.cleanup();
            } catch (e) {
                logger.error("Auto-cleanup error:", e);
            }
        }, 1 * 60 * 1000);
    }

    /** Adds tempalte for code so renderer can see inputs*/
    addTemplate(code) {
        return `import sys
import builtins
def custom_input(prompt=''):
    sys.stdout.write(prompt + '__WAITING_FOR_INPUT__')
    sys.stdout.flush()
    return sys.stdin.readline().strip()
builtins.input = custom_input

${code}
`;
    }
    /**Writes python file into a temp dir so it can be called after */
    async #writeCodeToTemp() {
        const scriptPath = path.join(this.tempDir.name, `${this.id}.py`);
        await fs.writeFile(scriptPath, this.python_code);

        for (const file of this.extraFiles) {
            const fullPath = path.join(this.tempDir.name, file.filename);
            await fs.outputFile(fullPath, file.content);
        }

        return scriptPath;
    }

    /** Starts container for Python*/
    /** Starts container for Python*/
    async #ensureContainer() {
        const volumeHostPath = this.tempDir.name;

        return new Promise((resolve, reject) => {
            // Get UID and GID directly from Node.js process (more reliable than shell commands)
            const uid = process.getuid ? process.getuid().toString() : "1000";
            const gid = process.getgid ? process.getgid().toString() : "1000";

            exec(`docker ps -a --format '{{.Names}}'`, (err, stdout) => {
                if (err) return reject(err);

                const createCmd = `docker run --user ${uid}:${gid} -dit --rm --name ${this.containerName} \
                -v ${volumeHostPath}:/workspace:ro \
                --tmpfs /tmp:rw,noexec,nosuid,size=64m \
                --read-only \
                --network none \
                --memory 128m \
                --pids-limit 64 \
                --cpus="0.2" \
                --security-opt=no-new-privileges \
                --cap-drop=ALL \
                python:${this.PYTHON_VERSION}-slim bash`;

                const containers = stdout.split('\n').filter(Boolean);
                if (containers.includes(this.containerName)) {
                    exec(`docker inspect -f '{{.State.Running}}' ${this.containerName}`, (err2, stdout2) => {
                        if (err2) return reject(err2);

                        if (stdout2.trim() === "true") {
                            resolve();
                        } else {
                            exec(`docker stop ${this.containerName}`, (stopErr) => {
                                if (stopErr) return reject(stopErr);

                                exec(`docker rm -f ${this.containerName}`, (rmErr) => {
                                    if (rmErr) return reject(rmErr);

                                    exec(createCmd, (err3) => {
                                        if (err3) return reject(err3);
                                        resolve();
                                    });
                                });
                            });
                        }
                    });
                } else {
                    exec(createCmd, (err4) => {
                        if (err4) return reject(err4);
                        resolve();
                    });
                }
            });
        });
    }

    /** Runs code until input or until end. Returns output and ends container if code end.*/
    async runCode(input = "") {
        await this.#ensureContainer();

        const scriptPath = await this.#writeCodeToTemp();
        const filesToCopy = [scriptPath, ...this.extraFiles.map(f => path.join(this.tempDir.name, f.filename))];

        for (const filePath of filesToCopy) {
            const filenameInContainer = path.basename(filePath);
            const copyCmd = spawn('docker', [
                'cp', filePath, `${this.containerName}:/workspace/${filenameInContainer}`
            ]);

            await new Promise((res, rej) => {
                copyCmd.on('error', (err) => rej(new Error("Failed to copy script to container: " + err.message)));
                copyCmd.on('close', res);
            });
        }

        return new Promise(async (resolve, reject) => {
            this.child = spawn('docker', [
                'exec', '-i', this.containerName,
                'bash', '-c', `cd /workspace && timeout 300 python3 ${this.id}.py`
            ], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            this.output = "";
            let errorOutput = ""; // Store errors from stderr

            this.child.stdout.on('data', (data) => {
                const text = data.toString();
                this.output += text;

                if (text.includes("__WAITING_FOR_INPUT__")) {
                    this.waitingForInput = true;
                    resolve({
                        status: "waiting_for_input",
                        output: this.output.replace(/__WAITING_FOR_INPUT__/g, input),
                        error: errorOutput || null // Include errors if any
                    });
                }
            });

            this.child.stderr.on('data', (data) => {
                errorOutput += data.toString(); // Collect errors from stderr
                this.output += data.toString(); // Add to output for compatibility
            });

            this.child.on('close', async (code) => {
                resolve({
                    status: "complete",
                    output: this.output.replace(/__WAITING_FOR_INPUT__/g, input),
                    error: errorOutput || (code !== 0 ? "Process exited with non-zero code" : null) // Include errors or non-zero exit code
                });
                await this.cleanup();
            });

            this.child.on('error', (err) => {
                // Handle spawn errors
                reject(new Error("Failed to execute script: " + err.message));
            });
        });
    }

    #sanitizeInput(input) {
        input = input.toString();
        return input.replace(/[\x00-\x1F\x7F;]/g, '').trim();
    }
    /** Adds input and returns output after it: until new input or end*/
    async addInput(input, checking = false) {
        input = this.#sanitizeInput(input);
        if (!this.child || !this.waitingForInput) {
            return {
                status: "complete",
                output: this.output.replace(/__WAITING_FOR_INPUT__/g, checking ? input : ""),
                error: "No active process or not waiting for input"
            };
        }

        this.waitingForInput = false;
        this.output = "";
        let errorOutput = ""; // Store errors from stderr

        this.child.stdin.write(input + "\n");

        return new Promise((resolve) => {
            let buffer = "";

            const onData = (chunk) => {
                const text = chunk.toString();
                buffer += text;

                if (text.includes("__WAITING_FOR_INPUT__")) {
                    if (this.child) {
                        this.child.stdout.off('data', onData);
                        this.child.stderr.off('data', onErrorData);
                    }
                    this.waitingForInput = true;
                    this.output = buffer;
                    resolve({
                        status: "waiting_for_input",
                        output: buffer.replace(/__WAITING_FOR_INPUT__/g, checking ? input : ""),
                        error: errorOutput || null
                    });
                }
            };

            const onErrorData = (chunk) => {
                errorOutput += chunk.toString(); // Collect errors from stderr
                buffer += chunk.toString(); // Add to output for compatibility
            };

            this.child.stdout.on('data', onData);
            this.child.stderr.on('data', onErrorData);

            // Handle process close during input processing
            this.child.on('close', (code) => {
                if (this.child) {
                    this.child.stdout.off('data', onData);
                    this.child.stderr.off('data', onErrorData);
                }
                this.output = buffer;
                resolve({
                    status: "complete",
                    output: buffer.replace(/__WAITING_FOR_INPUT__/g, checking ? input : ""),
                    error: errorOutput || (code !== 0 ? "Process exited with non-zero code" : null)
                });
            });
        });
    }

    /**Deletes container */
    async cleanup() {
        clearTimeout(this.autoCleanupTimeout);
        if (this.child) {
            this.child.kill();
            this.child = null;
        }

        this.tempDir.removeCallback();

        exec(`docker rm -f ${this.containerName}`, (error, stdout, stderr) => {
            if (error && !stderr.includes("is already in progress")) {
                logger.error(`Failed to remove container ${this.containerName}:`, error);
            }
        });
    }
}

module.exports = PythonRender;