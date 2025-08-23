const express = require("express");
const router = express.Router();

const MongoGetData = require("../database/mongo_get_data");
const MongoCreateData = require("../database/mongo_create_data");
const MongoUpdateData = require("../database/mongo_update_data");

const { requireAuth } = require("../scripts/SecurityChecks");
const logger = require("../scripts/Logging");

const PythonRender = require("../codeProcessing/python/PythonRender");
const NodeJSRender = require("../codeProcessing/js/NodeJSRender");
const ContainerManagerImport = require("../codeProcessing/ContainerManager");
const ContainerManager = new ContainerManagerImport();

router.post("/save-code", requireAuth, async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const { type, fileName, value, exerciseId } = req.body;
        const user = await MongoGetData.getUserBySession(sessionId)

        if (typeof fileName !== "string" || typeof value !== "string" || !fileName || !value) {
            return res.status(400).json({ error: "fileName and value must be non-empty strings" });
        }

        if (type === "user") {
            if (fileName in user.userFiles) {
                const userFiles = user.userFiles;
                userFiles[fileName] = value;
                await MongoUpdateData.update("user", { _id: user._id }, { userFiles: userFiles })
                res.status(200).json({ success: true })
            } else {
                res.status(404).json({ error: "File not found" })
            }
        }
        if (type === "exercise") {
            if (exerciseId) {
                const exercise = await MongoGetData.getExercise({ _id: exerciseId })
                if (exercise) {
                    const exerciseFiles = exercise.files;
                    if (fileName in exerciseFiles) {
                        const solution = await MongoGetData.getExerciseSolution({ exerciseId: exerciseId, userId: user._id })
                        let solutionFiles;
                        if (!solution) {
                            solutionFiles = { ...exerciseFiles };
                            solutionFiles[fileName] = value;
                            await MongoCreateData.createExerciseSolution(exerciseId, value, user._id, solutionFiles);
                            return res.status(200).json({ success: true });
                        } else {
                            solutionFiles = solution.solutionFiles;
                            solutionFiles[fileName] = value;
                            await MongoUpdateData.update("solution", { _id: solution._id }, { solution: value, solutionFiles: solutionFiles })
                            return res.status(200).json({ success: true });
                        }
                    } else {
                        return res.status(404).json({ error: "No such file found" })
                    }
                }
            }
            return res.status(404).json({ error: "Exercise not found" })
        }

    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

router.post("/render-code", requireAuth, async (req, res) => {
    try {
        const { files, mainFile, fileType } = req.body;

        const formatedFiles = Object.entries(files).map(([filename, content]) => ({
            filename,
            content
        }));

        if (fileType === "py" || fileType === "js") {
            const mainCode = formatedFiles.find(f => f.filename === mainFile)?.content;
            let container;
            if (fileType === "py") {
                container = new PythonRender(mainCode, formatedFiles);
            } else if (fileType === "js") {
                container = new NodeJSRender(mainCode, formatedFiles);
            }
            ContainerManager.add(container.id, container);
            try {
                const output = await container.runCode();
                if (output.status == "complete") {
                    return res.status(200).json({ output: output, waiting_for_input: false, complete: true })
                }
                if (output.status == "waiting_for_input") {
                    return res.status(201).json({ output: output, waiting_for_input: true, complete: false, code_id: container.id })
                }
                throw new Error("Code didn't run")
            } catch (err) {
                logger.error("Failed to run container : " + err)
                return res.status(400).json({ error: "Failed to run code" })
            }
        } else {
            return res.status(400).json({ error: "Can't run this file" })
        }
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

router.post("/send-input", requireAuth, async (req, res) => {
    try {
        const { id, input } = req.body;
        if (typeof input !== "string" || input.length > 1000) {
            return res.status(400).json({ error: "Invalid input" });
        }
        if (typeof id !== "string" || !/^[a-zA-Z0-9_-]+$/.test(id)) {
            return res.status(400).json({ error: "Invalid ID" });
        }
        const sanitizedInput = input.replace(/[\x00-\x1F\x7F]/g, "");

        const container = ContainerManager.getContainer(id);
        const output = await container.addInput(sanitizedInput);
        if (output.status == "complete") {
            return res.status(200).json({ output: output, waiting_for_input: false, complete: true })
        }
        if (output.status == "waiting_for_input") {
            return res.status(201).json({ output: output, waiting_for_input: true, complete: false, code_id: container.id })
        }
        throw new Error("Code failed to complete")
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

module.exports = router;