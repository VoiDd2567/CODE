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

            if (byClass) {
                const exerciseList = {}

                for (const exerciseId of course.courseExercises) {
                    const exercise = await MongoGetData.getExercise({ _id: exerciseId.toString() });
                    const solution = await MongoGetData.getExerciseSolution({ userId: userId, exerciseId: exercise._id })

                    let completeType = "r"
                    if (solution) {
                        const intSolPercent = parseInt(solution.answerCorrectPercent)
                        if (intSolPercent >= parseInt(exercise.minimalPercent)) {
                            completeType = "g"
                        } else {
                            if (intSolPercent > 0) {
                                completeType = "y"
                            }
                        }
                    }
                    exerciseList[exerciseId.toString()] = [exercise.name, completeType];
                }
                structuredAllowedExercises[course.name] = exerciseList;
            }
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

async function getUserMadeCourses(userId) { // Returns courses in format courseName : [courseId, [exerciseId: exerciseName]]
    const user = await MongoGetData.getUser({ _id: userId })
    if (!user) {
        throw Error("No user found")
    }

    try {
        let data = {}
        const userMadeCourses = user.madeCourses;

        for (const courseId of userMadeCourses) {
            const course = await MongoGetData.getCourse({ _id: courseId });

            let exercises = {}

            for (const exerciseId of course.courseExercises) {
                const exercise = await MongoGetData.getExercise({ _id: exerciseId });
                exercises[exerciseId] = exercise.name;
            }

            data[course.name] = [courseId, exercises]
            console.log(exercises)
        }

        return data
    } catch (err) {
        logger.error("Problem with getting user made courses: " + err)
        throw Error("Problem with getting user made courses")
    }
}

module.exports = { getUsersAllowedExercises, requireAuth, getUserMadeCourses };
