const mongoose = require("mongoose")
const User = require("./schemas/User");
const SchoolClass = require("./schemas/SchoolClass");
const Exercise = require("./schemas/Exercise");
const ExerciseSolution = require("./schemas/ExerciseSolution");
const Session = require("./schemas/Session")
const RegistrationCode = require("./schemas/RegistrationCode")
const Course = require("./schemas/Course")
const PasswordReset = require("./schemas/PasswordReset")
const TaskAccess = require("./schemas/TaskAccess")
const logger = require("../scripts/Logging")
const { deleteCache } = require("./cache/MongoCache")

class MongoDeleteData {
    static async deleteUser(userId) {
        try {
            const user = await User.findOneAndDelete({ _id: userId });
            if (user) {
                deleteCache().deleteUser(user);
            }
        } catch (err) {
            logger.error("Error deleting data : " + err)
        }
    }
    static async deleteSchoolClass(schoolClassId) {
        try {
            const schoolClass = await SchoolClass.findOneAndDelete({ _id: schoolClassId });
            if (schoolClass) {
                deleteCache().deleteSchoolClass(schoolClass);
            }
        } catch (err) {
            logger.error("Error deleting data : " + err)
        }
    }
    static async deleteExercise(exerciseId) {
        try {
            const exercise = await Exercise.findOneAndDelete({ _id: exerciseId });
            if (exercise) {
                deleteCache.deleteExercise(exerciseId);
            }
        } catch (err) {
            logger.error("Error deleting exercise: " + err);
        }
    }
    static async deleteExerciseSolution(exerciseSolutionId) {
        try {
            const solution = await ExerciseSolution.findOneAndDelete({ _id: exerciseSolutionId });
            if (solution) {
                deleteCache.deleteExerciseSolution(solution);
            }
        } catch (err) {
            logger.error("Error deleting exercise solution: " + err);
        }
    }
    static async deleteSession(sessionId) {
        try {
            const session = await Session.findOneAndDelete({ _id: sessionId });
            if (session) {
                deleteCache.deleteSession(session);
            }
        } catch (err) {
            logger.error("Error deleting session: " + err);
        }
    }
    static async deleteRegistrationCode(registrationCodeId) {
        try {
            const code = await RegistrationCode.findOneAndDelete({ _id: registrationCodeId });
            if (code) {
                deleteCache.deleteRegistrationCode(code);
            }
        } catch (err) {
            logger.error("Error deleting registration code: " + err);
        }
    }
    static async deleteCourse(courseId) {
        try {
            const course = await Course.findOneAndDelete({ _id: courseId });
            if (course) {
                deleteCache.deleteCourse(course);
            }
        } catch (err) {
            logger.error("Error deleting course: " + err);
        }
    }
    static async deletePasswordReset(passwordResetId) {
        try {
            await PasswordReset.findOneAndDelete({ _id: passwordResetId });
        } catch (err) {
            logger.error("Error deleting PasswordReset: " + err);
        }
    }

    static async deleteTaskAccess(userId, taskId, _id = null) {
        try {
            const query = _id
                ? { _id }
                : { userId, taskId };

            const deleted = await TaskAccess.findOneAndDelete(query);
            if (deleted) {
                deleteCache.deleteTaskAccess({ _id: deleted._id });
            }
        } catch (err) {
            logger.error("Error deleting TaskAccess: " + err);
        }
    }
}

module.exports = MongoDeleteData;
