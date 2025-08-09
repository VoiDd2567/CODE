const mongoose = require("mongoose")
const User = require("./schemas/User");
const SchoolClass = require("./schemas/SchoolClass");
const Exercise = require("./schemas/Exercise");
const ExerciseSolution = require("./schemas/ExerciseSolution");
const Session = require("./schemas/Session")
const RegistrationCode = require("./schemas/RegistrationCode")
const Course = require("./schemas/Course")
const logger = require("../scripts/Logging")
const MongoUpgradeData = require("./mongo_update_data");

class MongoDeleteData {
    static async deleteUser(userId) {
        try {
            const id = new mongoose.Types.ObjectId(userId);
            await User.deleteOne({ _id: id });
        } catch (err) {
            logger.error("Error deleting data : " + err)
        }
    }
    static async deleteSchoolClass(schoolClassId) {
        try {
            const id = new mongoose.Types.ObjectId(schoolClassId);
            await SchoolClass.deleteOne({ _id: id });
        } catch (err) {
            logger.error("Error deleting data : " + err)
        }
    }
    static async deleteExercise(exerciseId) {
        try {
            const id = new mongoose.Types.ObjectId(exerciseId);
            await Exercise.deleteOne({ _id: id });
        } catch (err) {
            logger.error("Error deleting data : " + err)
        }
    }
    static async deleteExerciseSolution(exerciseSolutionId) {
        try {
            const id = new mongoose.Types.ObjectId(exerciseSolutionId);
            await ExerciseSolution.deleteOne({ _id: id });
        } catch (err) {
            logger.error("Error deleting data : " + err)
        }
    }
    static async deleteSession(sessionId) {
        try {
            const id = new mongoose.Types.ObjectId(sessionId);
            await Session.deleteOne({ _id: id });
        } catch (err) {
            logger.error("Error deleting data : " + err)
        }
    }
    static async deleteRegistrationCode(registrationCodeId) {
        try {
            await RegistrationCode.deleteOne({ _id: registrationCodeId });
        } catch (err) {
            logger.error("Error deleting data : " + err)
        }
    }
    static async deleteCourse(courseId) {
        try {
            const id = new mongoose.Types.ObjectId(courseId);
            await Course.deleteOne({ _id: id });
        } catch (err) {
            logger.error("Error deleting data : " + err)
        }
    }

}

module.exports = MongoDeleteData;
