const { v4: uuidv4 } = require('uuid');
const fs = require("fs-extra");
const tmp = require('tmp');
const path = require('path');
const { spawn, exec } = require('child_process');
const logger = require("../../scripts/Logging");
const config = require("../../config.js")

/** Takes code (as string) and all files which needed to render code and renders Node.js code. Renders code until input, 
 * then returns current output and starts waiting for input. After getting input processes it and waits until next input.
 * Or if there is no inputs then completes code sends output and closes container.
 * Container automatically closes after 1 minute. If class died the container automatically deletes itself after 5 minutes.
 */
class NodeJSRender {
    constructor(js_code, extraFiles = []) {
        this.NODE_VERSION = config["NODE_VERSION"]; // Version variable for easy updates
        this.id = uuidv4();
        this.tempDir = tmp.dirSync({ unsafeCleanup: true, mode: 0o755 });
        this.js_code = this.addTemplate(js_code);
        this.extraFiles = extraFiles;
        this.containerName = `safe-nodejs-${this.id}`;
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

    addTemplate(code) {
        return `const readline = require('readline');
const util = require('util');

// Store callbacks for readline operations
let pendingCallbacks = [];
let isWaitingForInput = false;
let codeFinished = false;

// Override readline.createInterface
const originalCreateInterface = readline.createInterface;
readline.createInterface = function(options) {
    const rl = {
        question: function(prompt, callback) {
            // Store the callback
            pendingCallbacks.push(callback);
            isWaitingForInput = true;
            
            // Output prompt with marker
            process.stdout.write(prompt + '__WAITING_FOR_INPUT__');
        },
        close: function() {
            // Signal that readline is closed
            isWaitingForInput = false;
            checkIfShouldExit();
        }
    };
    
    return rl;
};

// Custom input function
function input(prompt = '') {
    return new Promise((resolve) => {
        pendingCallbacks.push(resolve);
        isWaitingForInput = true;
        process.stdout.write(prompt + '__WAITING_FOR_INPUT__');
    });
}

global.input = input;

// Handle stdin input
process.stdin.setEncoding('utf8');
process.stdin.on('data', (data) => {
    const inputValue = data.toString().trim();
    
    if (pendingCallbacks.length > 0) {
        const callback = pendingCallbacks.shift();
        isWaitingForInput = false;
        
        try {
            if (callback.constructor.name === 'AsyncFunction' || callback.then) {
                // It's a Promise resolve function
                callback(inputValue);
            } else {
                // It's a regular callback
                callback(inputValue);
            }
            
            // Check if we should exit after processing input
            setTimeout(checkIfShouldExit, 100);
        } catch (error) {
            console.error(error.message);
        }
    }
});

// Function to check if process should exit
function checkIfShouldExit() {
    if (codeFinished && !isWaitingForInput && pendingCallbacks.length === 0) {
        process.exit(0);
    }
}

// Keep process alive initially
process.stdin.resume();

// Execute user code
(async () => {
    try {
${code.split('\n').map(line => '        ' + line).join('\n')}
    } catch (error) {
        console.error(error.message);
    } finally {
        // Mark code as finished
        codeFinished = true;
        
        // Give a moment for any pending operations
        setTimeout(checkIfShouldExit, 100);
    }
})();
`;
    }

    async #writeCodeToTemp() {
        const scriptPath = path.join(this.tempDir.name, `${this.id}.js`);
        await fs.writeFile(scriptPath, this.js_code);

        // Create package.json for any potential dependencies
        const packageJson = {
            "name": "safe-js-runner",
            "version": "1.0.0",
            "description": "Safe JavaScript runner",
            "main": `${this.id}.js`,
            "type": "commonjs"
        };

        const packagePath = path.join(this.tempDir.name, 'package.json');
        await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2));

        for (const file of this.extraFiles) {
            const fullPath = path.join(this.tempDir.name, file.filename);
            await fs.outputFile(fullPath, file.content);
        }

        return scriptPath;
    }

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
                node:${this.NODE_VERSION}-slim bash`;

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

    /** Runs code until input or until end. Returns output and ends container if code end. */
    async runCode() {
        await this.#ensureContainer();

        const scriptPath = await this.#writeCodeToTemp();
        const packagePath = path.join(this.tempDir.name, 'package.json');
        const filesToCopy = [scriptPath, packagePath, ...this.extraFiles.map(f => path.join(this.tempDir.name, f.filename))];

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
                'bash', '-c', `cd /workspace && timeout 300 node ${this.id}.js`
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
                        output: this.output.replace(/__WAITING_FOR_INPUT__/g, ""),
                        error: errorOutput || null // Include errors if any
                    });
                }
            });

            this.child.stderr.on('data', (data) => {
                errorOutput += data.toString(); // Collect errors from stderr
                this.output += data.toString(); // Add to output for compatibility
                logger.error("Node.js stderr:", data.toString()); // Debug logging
            });

            this.child.on('close', async (code) => {
                resolve({
                    status: "complete",
                    output: this.output.replace(/__WAITING_FOR_INPUT__/g, "").split('\n')
                        .filter(line => line.trim() !== '')
                        .join('\n'),
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

    /** Adds input and returns output after it until new input or end */
    async addInput(input) {
        input = this.#sanitizeInput(input);
        if (!this.child || !this.waitingForInput) {
            return {
                status: "complete",
                output: this.output.replace(/__WAITING_FOR_INPUT__/g, "").split('\n')
                    .filter(line => line.trim() !== '')
                    .join('\n'),
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
                        output: buffer.replace(/__WAITING_FOR_INPUT__/g, ""),
                        error: errorOutput || null
                    });
                }
            };

            const onErrorData = (chunk) => {
                errorOutput += chunk.toString(); // Collect errors from stderr
                buffer += chunk.toString(); // Add to output for compatibility
                logger.error("Node.js stderr:", chunk.toString()); // Debug logging
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
                    output: buffer.replace(/__WAITING_FOR_INPUT__/g, "").split('\n')
                        .filter(line => line.trim() !== '')
                        .join('\n'),
                    error: errorOutput || (code !== 0 ? "Process exited with non-zero code" : null)
                });
            });
        });
    }

    /** Deletes container */
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

module.exports = NodeJSRender;