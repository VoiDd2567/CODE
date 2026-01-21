const express = require("express");
const router = express.Router()

const MongoGetData = require("../database/mongo_get_data");
const MongoCreateData = require("../database/mongo_create_data")
const { getUsersAllowedExercises, requireAuth } = require("../scripts/SecurityChecks")
const { safeExercise } = require("../scripts/SafeTemplates")
const ExerciseCheck = require("../codeProcessing/ExerciseCheck")
const logger = require("../scripts/Logging");
const MongoUpdateData = require("../database/mongo_update_data");

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
        if (allowedExercises.includes(exerciseId)) {
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

        if (exercise.programmingLng === "py" || exercise.programmingLng === "js") {
            const check = new ExerciseCheck(exercise._id, user._id);
            await check.init();
            const check_result = await check.checkSolution();
            res.status(200).json({ correct: check_result.correct, output: check_result.output, minimal_percent: exercise.minimalPercent })
        } else {
            res.status(400).json({ error: "Unfortunately we still don't have automatic checking for this programming language" })
        }

    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

router.post("/new-exercise", requireAuth, async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const { data } = req.body;

        const user = await MongoGetData.getUserBySession(sessionId)

        if (user.weight != "teacher") {
            return res.status(403).json({ error: "You are not allowed to use Exercise editor" })
        }
        if (!safeExercise(data)) {
            return res.status(409).json({ error: "Data wasn't correct or includes forbidden keys" })
        }

        data["creatorId"] = user._id;

        if (data.files && typeof data.files === 'object') {
            const converted = {};
            const filesArray = Array.isArray(data.files) ? data.files : Object.values(data.files);

            filesArray.forEach(file => {
                if (file && file.name && file.value !== undefined) {
                    converted[file.name] = file.value;
                }
            });
            data.files = converted;
        }

        if (data.description && typeof data.description === 'object') {
            const convertedDescription = {};

            Object.keys(data.description).forEach(lang => {
                let desc = data.description[lang];
                desc = desc.replace(/<<<code-block>>>([\s\S]*?)<<<\/code-block>>>/g, '<<editor>>$1<</editor>>');
                desc = desc.replace(/\n/g, '\\n');
                convertedDescription[lang] = desc;
            });

            data.description = convertedDescription;
        }
        const exerciseID = await MongoCreateData.createExercise(data)

        res.status(200).json({ correct: true, id: exerciseID }) //TODO : add privacy. That means getting it from user, changing safe template and giving user his private exercises
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

router.post("/access-course", requireAuth, async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const { courseId } = req.body;

        const user = await MongoGetData.getUserBySession(sessionId)
        if (!user) {
            return res.status(401).json({ error: "Unauthorized user" })
        }

        const course = await MongoGetData.getCourse({ courseAccessId: courseId })
        if (!course) {
            return res.status(404).json({ error: "No course found" })
        }

        let courseAllowedUsers = [...course.accessedUsers];

        const userIdStr = user._id.toString();
        if (courseAllowedUsers.includes(userIdStr)) {
            return res.status(409).json({ error: "Course is already added" })
        }
        courseAllowedUsers.push(userIdStr)
        await MongoUpdateData.update("course", { courseAccessId: courseId }, { accessedUsers: courseAllowedUsers })

        res.status(200).json({ success: true })
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

module.exports = router;