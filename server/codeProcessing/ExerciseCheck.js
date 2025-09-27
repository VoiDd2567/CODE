const PythonRender = require("./python/PythonRender");
const NodeJSRender = require("./js/NodeJSRender");

const MongoGetData = require("../database/mongo_get_data");
const MongoUpdateData = require("../database/mongo_update_data");

const ContainerManagerImport = require("./ContainerManager")
const ContainerManager = new ContainerManagerImport();
const logger = require("../scripts/Logging");
const { response } = require("express");
// Exercise types - choose 1 from list a.k. chooseFromList
//                  check code output a.k checkCodeOutput
//                  check code function return a.k. checkFuncReturn

// Mb it's good to add check many from list

//NB! It checks by USER SOLUTION. It takes it from db so before checking there has to be user solution writen in db

/** Before using need to init(). Class takes exerciseId and userId, finds user solution and checks if its correct.
 * Needs to already have an exercise solution in db
*/
class ExerciseCheck {
    constructor(exerciseId, userId) {
        this.exerciseId = exerciseId;
        this.userId = userId;
        this.maxTests = 5;
    }

    async init() {
        try {
            const exercise = await MongoGetData.getExercise({ _id: this.exerciseId });
            this.exerciseType = exercise.type;
            this.exerciseAutoCheck = exercise.autoCheck;
            if (!this.exerciseAutoCheck) { return }

            if (this.exerciseType === "choose") {
                this.exerciseChoiceAnswer = exercise.choiceAnswer;
            } else {
                this.exerciseAnswerType = exercise.answerCheckType;
                this.exerciseFiles = exercise.files;
                this.exerciseInputCount = exercise.inputCount;
                this.programmingLng = exercise.programmingLng;

                if (this.exerciseAnswerType === "checkCodeOutput") {
                    this.exerciseInputAnswers = exercise.inputAnswers; // {input : answer}
                    this.withoutInputAnswer = exercise.withoutInputAnswer;
                    return;
                }
                if (this.exerciseAnswerType === "checkFuncReturn") {
                    this.exerciseFunctionName = exercise.functionName;
                    this.exerciseFunctionReturns = exercise.functionReturns;
                }
            }
        } catch (err) {
            logger.error('FAILED: Failed to init ExerciseCheck')
            throw new Error("Failed to init ExerciseCheck")
        }
    }

    /**Gets solution by user and exercise ids and checks it depending on exercise type */
    async checkSolution() {
        try {
            const solution = await MongoGetData.getExerciseSolution({ exerciseId: this.exerciseId, userId: this.userId });
            if (!solution) {
                throw new Error("No user solution found");
            }
            this.userSolution = solution;
            if (!this.exerciseAutoCheck) { throw new Error("Exercise auto check is turned off"); };

            let responce;
            switch (this.exerciseAnswerType) {
                case "chooseFromList":
                    responce = await this.#processListCheck();
                    break
                case "checkCodeOutput":
                    responce = await this.#processCodeOutputCheck();
                    break
                case "checkFuncReturn":
                    responce = await this.#processFuncOutputCheck();
                    break
            }
            await MongoUpdateData.update("solution", { userId: this.userId, exerciseId: this.exerciseId }, { completeAnswer: true, answerCorrectPercent: responce.correct })

            if (responce) return responce;
            throw new Error("No responce")
        } catch (err) {
            if (!err.message.includes("Code contains input")) {
                logger.error("Failed to check solution" + err)
                return { correct: false, output: err.message }
            }
            return { correct: false, output: "The exercise can't check the function's work because the code contains input statements.\nIn order for the function to be auto-checked, there must not be any input statements in the code.\n" }
        }
    }

    async #processListCheck() {
        try {
            if (this.exerciseChoiceAnswer === this.userSolution.solution) {
                return true;
            }
            return false;
        } catch (err) {
            logger.error("FAILED: Failed to check solution in list check.")
            throw err;
        }
    }
    /**Auto check fore exercises with type codeOutputCheck */
    async #processCodeOutputCheck() {
        try {
            if (this.exerciseInputCount > 0) {
                this.#cutToMaxKeys()
                let totalOutput = "";
                let correctSolution = 100;
                for (let test of this.exerciseInputAnswers) {
                    const { input, output: answer } = test;
                    totalOutput += `---- Inputs : ${JSON.stringify(input)} ----\n`;
                    let output = await this.#runOneInstanceCode(this.userSolution.solution, answer, input);
                    totalOutput += this.#rightInscription(output);
                    if (!output.correct) {
                        correctSolution -= 100 * (1 / this.exerciseInputAnswers.length);
                    }
                }
                return { correct: correctSolution, output: totalOutput };
            } else {
                let output = await this.#runOneInstanceCode(this.userSolution.solution, this.withoutInputAnswer);
                output.output = this.#rightInscription(output);
                const correct = output.correct ? 100 : 0;
                return { correct: correct, output: output.output }
            }
        } catch (err) {
            logger.error("FAILED: Failed to check code output : " + err)
            throw err;
        }
    }

    /**Auto check fore exercises with type FuncOutputCheck */
    async #processFuncOutputCheck() {
        try {
            if (this.#detectInput(this.userSolution.solution, this.programmingLng)) {
                throw new Error("Code contains input")
            }
            let funcName = this.exerciseFunctionName;
            if (funcName != "no-func") {
                this.#cutToMaxKeys(true);
                let totalOutput = "";
                let correctSolution = 100;
                for (let test of this.exerciseFunctionReturns) {
                    const { input, output: funcReturn } = test;
                    totalOutput += `---- Inputs : ${JSON.stringify(input)} ----\n`;
                    let codeToRun = this.#addFuncRunIntoCode(
                        this.exerciseFunctionName,
                        this.userSolution.solution,
                        input,
                        funcReturn
                    );
                    let instance = await this.#runOneInstanceCode(codeToRun, funcReturn, null, true);
                    totalOutput += this.#rightInscription(instance, true);
                    if (!instance.correct) {
                        correctSolution -= 100 * (1 / this.exerciseFunctionReturns.length);
                    }
                }
                return { correct: correctSolution, output: totalOutput };
            } else {
                throw new Error("Wrong exercise check type")
            }
        } catch (err) {
            throw err;
        }
    }

    /**Runs code one time*/
    async #runOneInstanceCode(code, waitedOutput = null, inputs = null, func = false) {
        let container;
        try {
            const formatedFiles = Object.entries(this.exerciseFiles).map(([filename, content]) => ({
                filename,
                content
            }));
            if (this.programmingLng === "py") {
                container = new PythonRender(code, formatedFiles)
            } else if (this.programmingLng === "js") {
                container = new NodeJSRender(code, formatedFiles)
            }
            ContainerManager.add(container.id, container);
        } catch (err) {
            throw new Error("Failed to run container : " + err)
        }

        const startTime = Date.now()
        let instanceOutput;
        try {
            const runner = await container.runCode(inputs ? inputs[0] : "");
            instanceOutput = runner.output;
            if (runner.error) {
                return this.#outputCheckReturnTemplate(false, instanceOutput, "total-error")
            }
            if (inputs) {
                instanceOutput += "\n"
                for (let i = 0; i < this.exerciseInputCount; i++) {
                    if (inputs.length <= 0) {
                        throw new Error('Not enough inputs')
                    }
                    const output = await container.addInput(inputs[0], true);
                    instanceOutput += output.output + '\n';

                    if (output.error) {
                        return this.#outputCheckReturnTemplate(false, instanceOutput, "total-error")
                    }

                    inputs = inputs.slice(1)
                }
            }
        } catch (err) {
            throw new Error("Failed to process code :" + err)
        }

        try {
            const completeTime = ((Date.now() - startTime) / 1000).toFixed(2);
            if (func) {
                let check = this.#checkFuncReturn(instanceOutput)
                if (check.correct) {
                    return this.#outputCheckReturnTemplate(true, check.userOutput, null, waitedOutput, completeTime, check.funcOutput);
                }

                return this.#outputCheckReturnTemplate(false, check.userOutput, "not-right-return", waitedOutput, completeTime, check.funcOutput);
            } else {
                if (!waitedOutput) { throw new Error("Didn't get expected answer for code output") }
                if (this.#checkOutputReturn(instanceOutput, waitedOutput)) {
                    return this.#outputCheckReturnTemplate(true, instanceOutput, null, null, completeTime);
                }
                return this.#outputCheckReturnTemplate(false, instanceOutput, "not-right-output", waitedOutput, completeTime);
            }
        } catch (err) {
            throw new Error("Failed to check success of exercise")
        }
    }

    /**Template for data that's being returned after checking code or function output*/
    #outputCheckReturnTemplate(correct, output, error = null, waitedOutput = null, time = null, funcReturn = null) {
        return {
            correct: correct,
            output: output,
            funcReturn: funcReturn,
            errors: error || "no-errors",
            waitedOutput: waitedOutput || output,
            completeTime: time || null
        }
    }

    #rightInscription(output, func = false) {
        const needPBWaited = output.waitedOutput[0].includes("\n") ? "\n" : ""
        const needPBGot = output.output.includes("\n") ? "\n" : ""
        if (output.correct) {
            return `> SUCCESS ${output.completeTime}s\n${func ? `Function return : ${output.funcReturn}\n` : ""}Output:${needPBGot ? "\n" : " "}${output.output}\n\n`
        } else if (output.errors === "not-right-output") {
            return `> FAILED\nExercise was waiting this output:${needPBWaited ? "\n" : ""}${output.waitedOutput}\n${needPBWaited ? "\n" : ""}But got:${needPBGot ? "\n" : " "}${output.output}\n\n`
        } else if (output.errors === "total-error") {
            return `> FAILED\nTotal error :\n ${output.output}\n\n`
        } else if (output.errors === "not-right-return") {
            return `> FAILED\nFunction return was supposed to be:${needPBWaited ? "\n" : ""}${output.waitedOutput}\n${needPBWaited ? "\n" : ""}But was:${needPBGot ? "\n" : " "}${output.funcReturn}\n\nTotal output:\n${output.output}\n`
        }
        return `> UNKNOWN STATE\n${output.output ? "Output: " + JSON.stringify(output.output) : ""}\n\n`;
    }

    #cutToMaxKeys(func = false) {
        const key = func ? "exerciseFunctionReturns" : "exerciseInputAnswers";
        if (this[key].length > this.maxTests) {
            this[key] = this[key].sort(() => Math.random() - 0.5).slice(0, this.maxTests);
        }
    }

    /**Adds code into users code that checks if code output or function is correct */
    #addFuncRunIntoCode(funcName, code, funcParameters, funcReturn) {
        if (this.programmingLng === "py") {
            return code + `\n\nFuncReturnCheckFuncByCODE = ${funcName}(${funcParameters.toString()})\n`
                + `print("---RESULT@@#:")\n`
                + `print(FuncReturnCheckFuncByCODE == ${funcReturn})\n`
                + `print(FuncReturnCheckFuncByCODE)`;
        }
        if (this.programmingLng === "js") {
            return code + `\n\nconst FuncReturnCheckFuncByCODE = ${funcName}(${funcParameters.toString()})\n`
                + `console.log("---RESULT@@#:")\n`
                + `console.log(FuncReturnCheckFuncByCODE == ${funcReturn})\n`
                + `console.log(FuncReturnCheckFuncByCODE)`;
        }
    }

    #checkOutputReturn(output, waitedOutput) {
        const outputStr = String(output).replace(/\n/g, "");
        const waitedStr = String(waitedOutput).replace(/\n/g, "");
        return outputStr === waitedStr;
    }

    #checkFuncReturn(output) {
        const outputSeparated = output.split("---RESULT@@#:\n")
        const userOutput = outputSeparated[0];
        const result = outputSeparated[1].split("\n").filter(c => c != "");
        const correct = result[0].toLowerCase().includes("true");
        const funcOutput = result[1];
        return { correct: correct, funcOutput: funcOutput, userOutput: userOutput };
    }

    #detectInput(code, language) {
        if (!code || typeof code !== 'string') return false;

        const lang = language.toLowerCase();

        if (lang === 'python' || lang === 'py') {
            return /\binput\s*\(/.test(code);
        } else if (lang === 'javascript' || lang === 'js' || lang === 'nodejs') {
            return /\.question\s*\(|prompt\s*\(/.test(code);
        }

        return false;
    }
};

module.exports = ExerciseCheck;