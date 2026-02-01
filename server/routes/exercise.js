const express = require("express");
const router = express.Router()

const MongoGetData = require("../database/mongo_get_data");
const MongoCreateData = require("../database/mongo_create_data")
const { getUsersAllowedExercises, requireAuth } = require("../scripts/SecurityChecks")
const { isSafeExercise, safeExercise } = require("../scripts/SafeTemplates")
const ExerciseCheck = require("../codeProcessing/ExerciseCheck")
const logger = require("../scripts/Logging");
const MongoUpdateData = require("../database/mongo_update_data");
const MongoDeleteData = require("../database/mongo_delete_data");

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
            logger.warn(`${user._id} tryed to get acces to ${exerciseId}`)
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

router.post("/access-course", requireAuth, async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const { courseId } = req.body;

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

router.post("/create-course", requireAuth, async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const { courseName } = req.body;
        const user = await MongoGetData.getUserBySession(sessionId)

        if (user.weight != "teacher") {
            logger.warn(`${user._id} tryed to create course`)
            return res.status(401).json({ error: "You don't have permission for this action" })
        }

        const courseId = await MongoCreateData.createCourse(courseName, user._id)
        if (!courseId) {
            res.status(500).json({ error: "Internal server error : Couldn't create course" })
        }

        res.status(200).json({ courseId: courseId })
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

router.post("/create-exercise", requireAuth, async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const { courseId, exerciseName } = req.body;
        const user = await MongoGetData.getUserBySession(sessionId);
        const course = await MongoGetData.getCourse({ _id: courseId });

        if (course.creator != user._id) {
            logger.warn(`${user._id} tryed to add exercise into ${course._id}\n ExerciseName - ${exerciseName}`);
            return res.status(401).json({ error: "You don't have permission for this action" });
        }

        const exId = await MongoCreateData.createExercise({ type: "code", name: exerciseName, description: "", creatorId: user._id })
        course.courseExercises.push(exId)
        await MongoUpdateData.update("course", { _id: courseId }, { courseExercises: course.courseExercises })

        res.status(200).json({ complete: true, exId: exId })
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

router.post("/delete-course", requireAuth, async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const { courseId } = req.body;
        const user = await MongoGetData.getUserBySession(sessionId);
        const course = await MongoGetData.getCourse({ _id: courseId });

        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }
        if (course.creator != user._id) {
            logger.warn(`${user._id} tryed to delete ${course._id}`);
            return res.status(401).json({ error: "You don't have permission for this action" });
        }
        const exercises = course.courseExercises
        await MongoDeleteData.deleteCourse(courseId);

        exercises.forEach(async exerciseId => {
            await MongoDeleteData.deleteExercise(exerciseId)
        })

        return res.status(200).json({ complete: true });

    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

router.post("/delete-exercise", requireAuth, async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const { courseId, exerciseId } = req.body;
        const user = await MongoGetData.getUserBySession(sessionId);
        const exercise = await MongoGetData.getExercise({ _id: exerciseId });

        if (exercise.creatorId != user._id) {
            logger.warn(`${user._id} tryed to delete exercise ${exercise._id}`);
            return res.status(401).json({ error: "You don't have permission for this action" });
        }

        const course = await MongoGetData.getCourse({ _id: courseId });
        course.courseExercises = course.courseExercises.filter(
            id => id !== exerciseId
        );

        await MongoUpdateData.update("course", { _id: courseId }, { courseExercises: course.courseExercises })
        await MongoDeleteData.deleteExercise(exerciseId);

        return res.status(200).json({ complete: true });

    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

router.post("/update-exercise", requireAuth, async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const { exerciseId, data } = req.body;

        const user = await MongoGetData.getUserBySession(sessionId)

        if (user.weight != "teacher") {
            logger.warn(`${user._id} tryed to use Exercise editor`)
            return res.status(403).json({ error: "You are not allowed to use Exercise editor" })
        }
        if (!isSafeExercise(data)) {
            logger.warn(`${user._id} tryed to pass this data - ${data}`)
            return res.status(409).json({ error: "Data wasn't correct or includes forbidden keys" })
        }


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
                desc = desc.replace(/\[CODE_BLOCK\]([\s\S]*?)\[\/CODE_BLOCK\]/g, '<<editor>>$1<</editor>>');
                desc = desc.replace(/\n/g, '\\n');
                convertedDescription[lang] = desc;
            });

            data.description = convertedDescription;
        }
        const exerciseID = await MongoUpdateData.update("exercise", { _id: exerciseId }, data)

        res.status(200).json({ correct: true, id: exerciseID }) //TODO : add privacy. That means getting it from user, changing safe template and giving user his private exercises
        // Or not to do.... 
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})


router.post("/get-exercise-data", requireAuth, async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const { exerciseId } = req.body;

        const user = await MongoGetData.getUserBySession(sessionId)
        const exercise = await MongoGetData.getExercise({ _id: exerciseId })

        if (exercise.creatorId !== user._id) {
            return res.status(401).json({ error: "You don't have permission for this action" })
        }

        const sExercise = safeExercise(exercise)
        return res.status(200).json({ data: sExercise })

    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

router.post("/save-exercise-order", requireAuth, async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const { order } = req.body;

        const user = await MongoGetData.getUserBySession(sessionId)

        Object.entries(order).map(async ([courseId, exercises]) => {
            const course = await MongoGetData.getCourse({ _id: courseId })
            if (user._id !== course.creator) {
                logger.warn(`${user._id} tryed to change ${course._id} course`)
                return res.status(401).json({ error: "You don't have permission for this action" })
            }
            await MongoUpdateData.update("course", { _id: courseId }, { courseExercises: exercises })
        })

        res.status(200).json({ complete: true })
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

module.exports = router;