const mongoose = require("mongoose")
const User = require("./schemas/User");
const SchoolClass = require("./schemas/SchoolClass");
const Exercise = require("./schemas/Exercise");
const ExerciseSolution = require("./schemas/ExerciseSolution");
const Session = require("./schemas/Session")
const RegistrationCode = require("./schemas/RegistrationCode")
const Course = require("./schemas/Course")
const coloredText = require("../console_colors");
const MongoUpgradeData = require("./mongo_update_data");

class MongoDeleteData {
    static async deleteUser(userId) {
        const id = new mongoose.Types.ObjectId(userId);
        const result = await User.deleteOne({ _id: id });
    }
    static async deleteSchoolClass(schoolClassId) {
        const id = new mongoose.Types.ObjectId(schoolClassId);
        const result = await SchoolClass.deleteOne({ _id: id });
    }
    static async deleteExercise(exerciseId) {
        const id = new mongoose.Types.ObjectId(exerciseId);
        const result = await Exercise.deleteOne({ _id: id });
    }
    static async deleteExerciseSolution(exerciseSolutionId) {
        const id = new mongoose.Types.ObjectId(exerciseSolutionId);
        const result = await ExerciseSolution.deleteOne({ _id: id });
    }
    static async deleteSession(sessionId) {
        const id = new mongoose.Types.ObjectId(sessionId);
        const result = await Session.deleteOne({ _id: id });
    }
    static async deleteRegistrationCode(registrationCodeId) {
        const result = await RegistrationCode.deleteOne({ _id: registrationCodeId });
    }
    static async deleteCourse(courseId) {
        const id = new mongoose.Types.ObjectId(courseId);
        const result = await Course.deleteOne({ _id: id });
    }

}

module.exports = MongoDeleteData;
