const MongoGetData = require("../database/mongo_get_data")
const logger = require("./Logging");

const getUsersAllowedExercises = async (user, byClass = false) => {
    try {
        const userId = user._id.toString()
        const courses = await MongoGetData.getAllCourses()
        const allowedCourses = courses.filter(course => course.accessedUsers.includes(userId))

        const allowedExercises = allowedCourses.flatMap(course =>
            course.courseExercises.map(exerciseId => exerciseId.toString())
        )

        if (!byClass) {
            return allowedExercises;
        }

        const courseEntries = await Promise.all(
            allowedCourses.map(async (course) => {
                const courseId = course._id.toString();
                const exerciseEntries = await Promise.all(
                    course.courseExercises.map(async (exerciseId) => {
                        const exerciseIdStr = exerciseId.toString();
                        const [exercise, solution] = await Promise.all([
                            MongoGetData.getExercise({ _id: exerciseIdStr }),
                            MongoGetData.getExerciseSolution({ userId: userId, exerciseId: exerciseIdStr })
                        ])

                        let completeType = "r"
                        if (solution) {
                            const intSolPercent = parseInt(solution.answerCorrectPercent)
                            if (intSolPercent >= parseInt(exercise.minimalPercent)) {
                                completeType = "g"
                            } else if (intSolPercent > 0) {
                                completeType = "y"
                            }
                        }

                        return [exerciseIdStr, { name: exercise.name, completeType }];
                    })
                )

                return [courseId, { name: course.name, exercises: Object.fromEntries(exerciseEntries) }]
            })
        )

        return Object.fromEntries(courseEntries);
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
        const courses = await MongoGetData.getAllCourses();
        const userMadeCourses = [];

        courses.forEach(course => {
            if (course.creator == userId) {
                userMadeCourses.push(course._id.toString())
            }
        })

        for (const courseId of userMadeCourses) {
            const course = await MongoGetData.getCourse({ _id: courseId });

            let exercises = {}

            for (const exerciseId of course.courseExercises) {
                const exercise = await MongoGetData.getExercise({ _id: exerciseId });
                exercises[exerciseId] = exercise.name;
            }

            data[courseId] = [course.name, exercises, course.courseAccessId]
        }
        return data
    } catch (err) {
        logger.error("Problem with getting user made courses: " + err)
        throw Error("Problem with getting user made courses")
    }
}

module.exports = { getUsersAllowedExercises, requireAuth, getUserMadeCourses };
