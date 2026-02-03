const PythonRender = require("./python/PythonRender");
const NodeJSRender = require("./js/NodeJSRender");

const MongoGetData = require("../database/mongo_get_data");
const MongoUpdateData = require("../database/mongo_update_data");

const ContainerManagerImport = require("./ContainerManager")
const ContainerManager = new ContainerManagerImport();
const logger = require("../scripts/Logging");
const config = require("../config.js")


class ExerciseCheck {
    constructor(userId, exerciseId) {
        this.userId = userId
        this.exerciseId = exerciseId
        this.maxChecks = config["EXERCISE_CHECK_AMOUNT"]
    }

    async init() {
        try {
            this.exercise = await MongoGetData.getExercise({ _id: this.exerciseId })
            this.solution = await MongoGetData.getExerciseSolution({ exerciseId: this.exerciseId, userId: this.userId })

            if (!this.exercise) {
                throw new Error("No exercise found")
            }
            if (!this.solution) {
                throw new Error("No solution found")
            }

            this.codeLng = this.exercise.codeLng
            this.autoCheck = this.exercise.autoCheck
            this.rightSolutionCode = this.exercise.completeSolution
            this.exerciseType = this.exercise.exerciseType // funcCheck; fileCheck; outputCheck 
            this.exerciseChecksFile = this.exercise.checksFile
            this.completePercent = this.exercise.minimalPercent
            this.solutionCode = this.solution.solution
            this.solutionFiles = this.solution.solutionFiles


        } catch (err) {
            logger.error("Failed to initialize ExerciseCheck:" + err)
            throw new Error("Failed to initialize ExerciseCheck")
        }
    }

    async checkSolution() {
        if (!this.autoCheck) { return "AutoCheck is turned off" }
        try {
            let result = { success: false };
            if (this.exerciseType === "outputCheck") {
                result = await this.#processOutputCheck()
            }
            if (this.exerciseType === "funcCheck") {
                result = await this.#processFuncCheck()
            }
            await MongoUpdateData.update("solution", { userId: this.userId, exerciseId: this.exerciseId }, { completeAnswer: true, answerCorrectPercent: result.successPercent })
            return result
        } catch (err) {
            logger.error("Failed to check solution " + err)
            return { correct: false, output: err.message }
        }
    }

    async #processOutputCheck() {
        const checks = this.#processChecksFile()
        let result = []

        if (!checks) {
            const solutionInstance = await this.#runOneInstance(this.solutionCode, null, this.solutionFiles)
            const rightSolutionInstance = await this.#runOneInstance(this.rightSolutionCode)
            result.push(this.#processInstances(solutionInstance, rightSolutionInstance))
        }
        else {
            for (const check of checks) {
                if (check.file) {
                    this.solutionFiles[check.file.filename] = check.file.content;
                    check.file = { [check.file.filename]: check.file.content }
                }

                const solutionInstance = await this.#runOneInstance(this.solutionCode, check.inputs, this.solutionFiles)
                const rightSolutionInstance = await this.#runOneInstance(this.rightSolutionCode, check.inputs, check.file)

                result.push(this.#processInstances(solutionInstance, rightSolutionInstance, check))
            }
        }

        return this.#processResult(result);
    }

    async #processFuncCheck() {
        const checks = this.#processChecksFile()
        const funcName = this.exercise.funcName
        let result = []
        for (const check of checks) {

            if (check.file) {
                this.solutionFiles[check.file.filename] = check.file.content;
                check.file = { [check.file.filename]: check.file.content }
            }

            const formattedSolutionCode = this.#prepareFuncCode(this.solutionCode, funcName, check.params)
            const formattedRightSolutionCode = this.#prepareFuncCode(this.rightSolutionCode, funcName, check.params)

            const solutionInstance = await this.#runOneInstance(formattedSolutionCode, check.inputs, this.solutionFiles)
            const rightSolutionInstance = await this.#runOneInstance(formattedRightSolutionCode, check.inputs, check.file)

            result.push(this.#processInstances(solutionInstance, rightSolutionInstance, check))
        }
        return this.#processResult(result);
    }

    async #runOneInstance(code, inputs = null, extraFiles = []) {
        if (extraFiles === null) {
            extraFiles = []
        } else {
            extraFiles = Object.entries(extraFiles).map(([filename, content]) => ({
                filename,
                content
            }));
        }

        let container;
        try {
            if (this.codeLng === "py") {
                container = new PythonRender(code, extraFiles)
            } else if (this.codeLng === "js") {
                container = new NodeJSRender(code, extraFiles)
            }
            ContainerManager.add(container.id, container);
        } catch (err) {
            throw new Error("Failed to create container : " + err)
        }

        const startTime = Date.now()
        try {
            const runner = await container.runCode();
            let success = runner.error ? false : true;
            let err = runner.error ? runner.error : "";

            if (inputs && inputs != null) {
                runner.output += "\n"
                for (let i = 0; i < inputs.length; i++) {
                    const inputRunner = await container.addInput(inputs[i], true);
                    runner.output += inputRunner.output + '\n';
                    if (inputRunner.error) {
                        success = false;
                        err += "\n" + inputRunner.error;
                    }
                }
            }

            const completeTime = ((Date.now() - startTime) / 1000).toFixed(2);
            return this.#normalizeInstanceOutput(success, completeTime, runner.output, err)
        } catch (err) {
            throw new Error("Failed to process code :" + err)
        }
    }

    #prepareFuncCode(code, funcName, funcParameters) {
        if (this.codeLng === "py") {
            return code + `\n\nprint(${funcName}(${funcParameters}))`
        }
        if (this.codeLng === "js") {
            return code + `\n\nconsole.log(${funcName}(${funcParameters}))`
        }
    }

    #processChecksFile() {
        let checks = this.exerciseChecksFile.split(config["CHECK_SPLIT_OBJECT"]);

        const shuffle = array => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        checks = shuffle(checks);
        if (this.maxChecks && checks.length > this.maxChecks) {
            checks = checks.slice(0, this.maxChecks);
        }

        const items = [];

        checks.forEach(check => {
            const obj = { inputs: null, file: null };

            const inputMatch = check.match(/<-input->([\s\S]*?)<\/-input->/);
            if (inputMatch) {
                obj.inputs = inputMatch[1].trim().split(";;");
            }

            const fileMatch = check.match(/<-file->([\s\S]*?)<\/-file->/);
            if (fileMatch) {
                const fMatch = fileMatch[1].match(/['"](.+?)['"]\s*:\s*['"]([\s\S]*)['"]/);
                if (fMatch) {
                    obj.file = {
                        filename: fMatch[1],
                        content: fMatch[2]
                    };
                }
            }


            if (this.exerciseType === "funcCheck") {
                const paramMatch = check.match(/<-param->([\s\S]*?)<\/-param->/);
                if (paramMatch) {
                    obj.params = paramMatch[1].trim();
                }
            }

            if (Object.keys(obj).length > 0) {
                items.push(obj);
            }
        });

        return items;
    }

    #processInstances(solutionInstance, rightSolutionInstance, check = null) {
        if (solutionInstance.error) {
            return this.#normalizeResult(false, check, solutionInstance.completeTime, solutionInstance.error)
        } else if (solutionInstance.output !== rightSolutionInstance.output) {
            return this.#normalizeResult(false, check, solutionInstance.completeTime, null, true)
        } else if (solutionInstance.output === rightSolutionInstance.output) {
            return this.#normalizeResult(true, check, solutionInstance.completeTime)
        }
    }

    #processResult(results) {
        let resultText = "";
        let rightSol = 0;

        results.forEach(result => {
            if (result.success === true) {
                rightSol += 1
            }
            resultText += this.#rightInscription(result, result?.params ? result.params : null)
        })

        const successPercent = results.length > 0 ? Math.round((rightSol / results.length) * 100) : 0
        const success = this.completePercent <= successPercent ? true : false;
        return { success: success, successPercent: successPercent, output: resultText }
    }

    #normalizeInstanceOutput(success, completeTime, output, error = null) {
        return {
            success: success,
            completeTime: completeTime,
            output: output,
            error: error
        }
    }

    #normalizeResult(success, params, completeTime, error = null, wrong = false) {
        return {
            success: success,
            error: error,
            params: params,
            completeTime: completeTime,
            wrong: wrong
        }
    }

    #rightInscription(output, params = null) {
        const paramsValue = params?.params ? params.params : "";

        if (output.success) {
            return `> SUCCESS ${output.completeTime}s\n${paramsValue ? `Test data - [${paramsValue}]\n` : ""}\n`
        } else if (output.wrong) {
            return `> FAILED ${output.completeTime}\n${paramsValue ? `Test data - [${paramsValue}]\n` : "Result wasn't right\n"}\n`
        } else if (output.error) {
            return `> FAILED\nTotal error :\n ${output.error}\n\n`
        }
        return `> UNKNOWN STATE\n${output.output ? "Output: " + JSON.stringify(output.output) : ""}\n\n`;
    }
}

module.exports = ExerciseCheck;