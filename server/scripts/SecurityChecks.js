const MongoGetData = require("../database/mongo_get_data")

const getUsersAllowedExercises = async (user, byClass = false) => {
    const userCourses = user.accessedCourses;
    const allowedExercisesByCourse = {};
    const allowedExercises = {};

    try {
        const courses = [];
        for (const courseId of userCourses) {
            const course = await MongoGetData.getCourse({ _id: courseId });
            if (course) {
                courses.push(course);
            }
        }

        const allExerciseIds = [...new Set(
            courses.flatMap(course => course.courseExercises)
        )];

        const exerciseMap = {};
        for (const exerciseId of allExerciseIds) {
            const exercise = await MongoGetData.getExercise({ _id: exerciseId });
            if (exercise) {
                exerciseMap[exerciseId] = exercise;
            }
        }

        for (const course of courses) {
            const courseExercises = {};

            for (const exerciseId of course.courseExercises) {
                const exercise = exerciseMap[exerciseId];
                if (exercise) {
                    courseExercises[exerciseId] = exercise.name;
                    allowedExercises[exerciseId] = exercise.name;
                }
            }

            allowedExercisesByCourse[course.name] = courseExercises;
        }

        return byClass ? allowedExercisesByCourse : allowedExercises;

    } catch (error) {
        console.error('Error fetching user allowed exercises:', error);
        throw error;
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
