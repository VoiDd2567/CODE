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

/**
 * Class for checking user's exercise solutions
 * Requires initialization with exercise ID and user ID
 * Provides methods for checking solution correctness
 */
class ExerciseCheck {
    /**
     * Constructor for ExerciseCheck class
     * @param {string} exerciseId - The ID of the exercise to check
     * @param {string} userId - The ID of the user whose solution is being checked
     */
    constructor(exerciseId, userId) {
        this.exerciseId = exerciseId;
        this.userId = userId;
        this.maxTests = 5;
    }

    /**
     * Initializes the ExerciseCheck instance by loading exercise data from database
     * Sets up exercise type, answer checking method, and required parameters
     * @throws {Error} If initialization fails
     */
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

    /**
     * Main method to check user's solution against exercise requirements
     * Routes to appropriate checking method based on exercise type
     * @returns {Object} Result object with correctness percentage and output details
     * @throws {Error} If no solution found or exercise auto-check is disabled
     */
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

    /**
     * Checks multiple choice exercises by comparing user's answer with correct answer
     * @returns {boolean} True if answer is correct, false otherwise
     * @private
     */
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

    /**
     * Auto check for exercises with type checkCodeOutput
     * Runs user's code with test inputs and compares outputs with expected results
     * @returns {Object} Result with correctness percentage and detailed output
     * @private
     */
    async #processCodeOutputCheck() {
        try {
            if (this.exerciseInputCount > 0) {
                this.#cutToMaxKeys()
                let totalOutput = "";
                let correctSolution = 100;
                for (let test of this.exerciseInputAnswers) {
                    const { input, output: answer } = test;
                    totalOutput += `---- Inputs : ${JSON.stringify(input).replace(/"/g, "")} ----\n`;
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

    /**
     * Auto check for exercises with type checkFuncReturn
     * Tests user's function with various inputs and checks return values
     * @returns {Object} Result with correctness percentage and detailed output
     * @private
     */
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
                    totalOutput += `---- Inputs : ${JSON.stringify(input).replace(/"/g, "")} ----\n`;
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

    /**
     * Runs code in isolated container environment for single test case
     * Handles both Python and JavaScript code execution
     * @param {string} code - The code to execute
     * @param {*} waitedOutput - Expected output for comparison (null for function checks)
     * @param {Array} inputs - Input values to provide to the code
     * @param {boolean} func - True if checking function return, false for output check
     * @returns {Object} Result object with execution details and correctness
     * @private
     */
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

    /**
     * Creates standardized response template for code checking results
     * @param {boolean} correct - Whether the code execution was correct
     * @param {string} output - The actual output from code execution
     * @param {string} error - Error type if any (null if no error)
     * @param {*} waitedOutput - Expected output for comparison
     * @param {string} time - Execution time in seconds
     * @param {*} funcReturn - Function return value for function checks
     * @returns {Object} Formatted result object
     * @private
     */
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

    /**
     * Formats output string with appropriate success/failure messages
     * Handles different error types and formats display text
     * @param {Object} output - Result object from code execution
     * @param {boolean} func - True if checking function return, false for output check
     * @returns {string} Formatted output string for display
     * @private
     */
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

    /**
     * Limits the number of test cases to maxTests by randomly selecting subset
     * Prevents excessive execution time for exercises with many test cases
     * @param {boolean} func - True to limit function tests, false for input/output tests
     * @private
     */
    #cutToMaxKeys(func = false) {
        const key = func ? "exerciseFunctionReturns" : "exerciseInputAnswers";
        if (this[key].length > this.maxTests) {
            this[key] = this[key].sort(() => Math.random() - 0.5).slice(0, this.maxTests);
        }
    }

    /**
     * Injects function call and result checking code into user's solution
     * Adds print statements to capture function return value and comparison result
     * @param {string} funcName - Name of the function to test
     * @param {string} code - User's original code
     * @param {Array} funcParameters - Parameters to pass to the function
     * @param {*} funcReturn - Expected return value
     * @returns {string} Modified code with function call and checking logic
     * @private
     */
    #addFuncRunIntoCode(funcName, code, funcParameters, funcReturn) {
        if (this.programmingLng === "py") {
            return code + `\n\nFuncReturnCheckFuncByCODE = ${funcName}(${funcParameters.toString()})\n`
                + `print("---RESULT@@#:")\n`
                + `FuncReturnCheckFuncByCODE = str(FuncReturnCheckFuncByCODE).replace(" ","")\n`
                + `print(FuncReturnCheckFuncByCODE == "${funcReturn}")\n`
                + `print(FuncReturnCheckFuncByCODE)`;
        }
        if (this.programmingLng === "js") {
            return code + `\n\nconst FuncReturnCheckFuncByCODE = ${funcName}(${funcParameters.toString()})\n`
                + `console.log("---RESULT@@#:")\n`
                + `FuncReturnCheckFuncByCODE = FuncReturnCheckFuncByCODE.toString().replace(/ /g,"")\n`
                + `console.log(FuncReturnCheckFuncByCODE == "${funcReturn})"\n`
                + `console.log(FuncReturnCheckFuncByCODE)`;
        }
    }

    /**
     * Compares actual output with expected output for code output exercises
     * Removes newlines for comparison to handle formatting differences
     * @param {*} output - Actual output from code execution
     * @param {*} waitedOutput - Expected output
     * @returns {boolean} True if outputs match, false otherwise
     * @private
     */
    #checkOutputReturn(output, waitedOutput) {
        const outputStr = String(output).replace(/\n/g, "");
        const waitedStr = String(waitedOutput).replace(/\n/g, "");
        return outputStr === waitedStr;
    }

    /**
     * Parses function execution output to extract comparison result and return value
     * Splits output by special marker to separate user output from test results
     * @param {string} output - Combined output from function execution
     * @returns {Object} Object with correctness status, function return value, and user output
     * @private
     */
    #checkFuncReturn(output) {
        const outputSeparated = output.split("---RESULT@@#:\n")
        const userOutput = outputSeparated[0];
        const result = outputSeparated[1].split("\n").filter(c => c != "");
        const correct = result[0].toLowerCase().includes("true");
        const funcOutput = result[1];
        return { correct: correct, funcOutput: funcOutput, userOutput: userOutput };
    }

    /**
     * Detects if code contains input statements that would interfere with auto-checking
     * Supports both Python (input()) and JavaScript (prompt(), question())
     * @param {string} code - The code to analyze
     * @param {string} language - Programming language ('py', 'js', etc.)
     * @returns {boolean} True if input statements are detected, false otherwise
     * @private
     */
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