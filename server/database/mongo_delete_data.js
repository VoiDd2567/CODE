const mongoose = require("mongoose")
const User = require("./schemas/User");
const SchoolClass = require("./schemas/SchoolClass");
const Exercise = require("./schemas/Exercise");
const ExerciseSolution = require("./schemas/ExerciseSolution");
const Session = require("./schemas/Session")
const RegistrationCode = require("./schemas/RegistrationCode")
const Course = require("./schemas/Course")
const logger = require("../scripts/Logging")
const { deleteCache } = require("./cache/MongoCache")

class MongoDeleteData {
    static async deleteUser(userId) {
        try {
            const user = await User.findOne({ _id: userId });
            deleteCache().deleteUser(user);
            await User.deleteOne({ _id: userId });
        } catch (err) {
            logger.error("Error deleting data : " + err)
        }
    }
    static async deleteSchoolClass(schoolClassId) {
        try {
            const schoolClass = await SchoolClass.findOne({ _id: schoolClassId });
            deleteCache().deleteSchoolClass(schoolClass);
            await SchoolClass.deleteOne({ _id: schoolClassId });
        } catch (err) {
            logger.error("Error deleting data : " + err)
        }
    }
    static async deleteExercise(exerciseId) {
        try {
            const exercise = await Exercise.findOne({ _id: exerciseId });
            if (exercise) {
                deleteCache.deleteExercise(exerciseId);
                await Exercise.deleteOne({ _id: exerciseId });
            }
        } catch (err) {
            logger.error("Error deleting exercise: " + err);
        }
    }
    static async deleteExerciseSolution(exerciseSolutionId) {
        try {
            const solution = await ExerciseSolution.findOne({ _id: exerciseSolutionId });
            if (solution) {
                deleteCache.deleteExerciseSolution(solution);
                await ExerciseSolution.deleteOne({ _id: exerciseSolutionId });
            }
        } catch (err) {
            logger.error("Error deleting exercise solution: " + err);
        }
    }
    static async deleteSession(sessionId) {
        try {
            const session = await Session.findOne({ _id: sessionId });
            if (session) {
                deleteCache.deleteSession(session);
                await Session.deleteOne({ _id: sessionId });
            }
        } catch (err) {
            logger.error("Error deleting session: " + err);
        }
    }
    static async deleteRegistrationCode(registrationCodeId) {
        try {
            const code = await RegistrationCode.findOne({ _id: registrationCodeId });
            if (code) {
                deleteCache.deleteRegistrationCode(code);
                await RegistrationCode.deleteOne({ _id: registrationCodeId });
            }
        } catch (err) {
            logger.error("Error deleting registration code: " + err);
        }
    }
    static async deleteCourse(courseId) {
        try {
            const course = await Course.findOne({ _id: courseId });
            if (course) {
                deleteCache.deleteCourse(course);
                await Course.deleteOne({ _id: courseId });
            }
        } catch (err) {
            logger.error("Error deleting course: " + err);
        }
    }
}

module.exports = MongoDeleteData;
