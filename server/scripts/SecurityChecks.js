const MongoGetData = require("../database/mongo_get_data")
const logger = require("./Logging");

const getUsersAllowedExercises = async (user, byClass = false) => {
    try {
        const userId = user._id
        const courses = await MongoGetData.getAllCourses()

        const allowedExercises = []
        const structuredAllowedExercises = {}

        for (const course of courses) {
            if (!course.accessedUsers.includes(userId)) continue;

            allowedExercises.push(...course.courseExercises)

            const exerciseList = {}

            for (const exerciseId of course.courseExercises) {
                const exercise = await MongoGetData.getExercise({ _id: exerciseId });
                exerciseList[exerciseId] = exercise.name;
            }
            structuredAllowedExercises[course.name] = exerciseList;
        }

        return byClass ? structuredAllowedExercises : allowedExercises;
    } catch (err) {
        logger.error("Problem with getting user courses: " + err)
        throw Error("Problem with getting user courses")
    }

};

const requireAuth = async (req, res, next) => {
    const sessionId = req.cookies.sessionId;
    const session = await MongoGetData.getSession({ sessionId });
    if (!session || !session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    req.session = session;
    next();
}

module.exports = { getUsersAllowedExercises, requireAuth };
