const express = require("express");
const router = express.Router()

const MongoGetData = require("../database/mongo_get_data");
const { getUsersAllowedExercises, requireAuth } = require("../scripts/SecurityChecks")
const logger = require("../scripts/Logging")

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

        if (exerciseId in allowedExercises) {
            res.status(200).json({ exercise: exercise })
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

    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

module.exports = router;