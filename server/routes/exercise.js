const express = require("express");
const router = express.Router()

const MongoGetData = require("../database/mongo_get_data");
const { getUsersAllowedExercises, requireAuth } = require("../scripts/SecurityChecks")
const PythonExerciseCheck = require("../codeProcessing/ExerciseCheck")
const logger = require("../scripts/Logging");

router.get("/get-exercises", requireAuth, async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const user = await MongoGetData.getUserBySession(sessionId)
        const allowedExercises = await getUsersAllowedExercises(user, true);

        res.status(200).json({ exerciseList: allowedExercises })
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

router.post("/get-exercise", requireAuth, async (req, res) => {
    try {
        const { exerciseId } = req.body;
        const exercise = await MongoGetData.getExercise({ _id: exerciseId });
        if (!exercise) {
            return res.status(404).json({ error: "No exercise found" })
        }

        const sessionId = req.cookies.sessionId;
        const user = await MongoGetData.getUserBySession(sessionId)
        const allowedExercises = await getUsersAllowedExercises(user);

        const solution = await MongoGetData.getExerciseSolution({ exerciseId: exerciseId, userId: user._id })
        const files = solution ? solution.solutionFiles : null;
        if (exerciseId in allowedExercises) {
            res.status(200).json({ exercise: exercise, userSolution: files })
        } else {
            res.status(403).json({ error: "You don't have access to this exercise" })
        }

    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
});

router.post("/check-exercise", requireAuth, async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const { exerciseId } = req.body;

        const user = await MongoGetData.getUserBySession(sessionId)
        const exercise = await MongoGetData.getExercise({ _id: exerciseId });

        if (exercise.programmingLng === "py") {
            const check = new PythonExerciseCheck(exercise._id, user._id);
            await check.init();
            const check_result = await check.checkSolution();
            res.status(200).json({ correct: check_result.correct, output: check_result.output })
        } else {
            res.status(400).json({ error: "Unfortunately we still don't have automatic checking for this programming language" })
        }

    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

module.exports = router;