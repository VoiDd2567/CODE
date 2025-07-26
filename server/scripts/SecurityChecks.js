const MongoGetData = require("../database/mongo_get_data")

const getUsersAllowedExercises = async (user, byClass = false) => {
    const userCourses = user.accessedCourses;
    const allowedExercisesByCourse = {};
    const allowedExercises = {};

    const coursePromises = userCourses.map(courseId =>
        MongoGetData.getCourse({ _id: courseId })
    );
    const courses = await Promise.all(coursePromises);

    for (const course of courses) {
        if (!course) continue;
        const courseExercises = {};

        const exercisePromises = course.courseExercises.map(exerciseId =>
            MongoGetData.getExercise({ _id: exerciseId })
        );
        const exercises = await Promise.all(exercisePromises);

        exercises.forEach((exercise, index) => {
            const exerciseId = course.courseExercises[index];
            if (exercise) {
                courseExercises[exerciseId] = exercise.name;
                allowedExercises[exerciseId] = exercise.name;
            }
        });

        allowedExercisesByCourse[course.name] = courseExercises;
    }
    if (byClass) {
        return allowedExercisesByCourse;
    }
    return allowedExercises;
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
