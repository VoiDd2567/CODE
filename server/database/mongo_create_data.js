const User = require("./schemas/User");
const SchoolClass = require("./schemas/SchoolClass");
const Exercise = require("./schemas/Exercise");
const ExerciseSolution = require("./schemas/ExerciseSolution");
const Session = require("./schemas/Session")
const RegistrationCode = require("./schemas/RegistrationCode")
const Course = require("./schemas/Course")
const logger = require("../scripts/Logging")
const MongoGetData = require("./mongo_get_data");
const MongoDeleteData = require("./mongo_delete_data")

class MongoCreateData {
  static async createUser(username, weight, password, email, schoolClass = null) {
    try {
      const user = new User({ username, weight, password, email, schoolClass });
      const savedUser = await user.save();
      return savedUser._id;
    } catch (err) {
      logger.error("Error creating user: " + err.message)
      throw err;
    }
  }

  static async createClass(name, teacher, students = null) {
    try {
      const schoolClass = new SchoolClass({ name, teacher, students });
      const savedClass = await schoolClass.save();
      return savedClass._id;
    } catch (err) {
      logger.error("Error creating class: " + err.message)
      throw err;
    }
  }

  static async createExercise(type, description, answer = null) {
    try {
      const exercise = new Exercise({ type, description, answer });
      const savedExercise = await exercise.save();
      return savedExercise._id;
    } catch (err) {
      logger.error("Error creating exercise: " + err.message)
      throw err;
    }
  }

  static async createExerciseSolution(exerciseId, answer, userId, files = {}, answerCorrect = null) {
    try {
      const exercise = await MongoGetData.getExercise({ _id: exerciseId })
      if (!exercise) {
        logger.error("No exercise with this id was found: " + exerciseId)
        throw new Error("No exercise found");
      }

      const exerciseSolution = new ExerciseSolution({ exerciseId: exerciseId, answer: answer, userId: userId, answerCorrect: answerCorrect, files: files });
      const savedExerciseSolution = await exerciseSolution.save();
      return savedExerciseSolution._id;
    } catch (err) {
      logger.error("Error creating exerciseSolution: " + err.message)
      throw err;
    }
  }

  static async createSession(sessionId, userId = null) {
    try {
      const existing = await Session.findOne({ sessionId });

      if (!userId) {
        if (existing) {
          return existing._id;
        }
      } else {
        await MongoDeleteData.deleteSession(existing._id);
      }

      const session = new Session({ sessionId, userId });
      const savedSession = await session.save();
      return savedSession._id;

    } catch (err) {
      logger.error("Error creating session: " + err.message)
      throw err;
    }
  }

  static async createRegistrationCode(sessionId, username, email, password, weight) {
    try {
      const existing = await RegistrationCode.findOne({ sessionId });

      if (existing) {
        return existing._id;
      }

      const code = String(Math.floor(100000 + Math.random() * 900000));


      const codeExpires = new Date();
      codeExpires.setMinutes(codeExpires.getMinutes() + 10)

      const newCodeSend = new Date();
      newCodeSend.setMinutes(newCodeSend.getMinutes() + 1)

      const registrationCode = new RegistrationCode({ sessionId, username, email, password, code, newCodeSend, codeExpires, weight });
      const savedRegistrationCode = await registrationCode.save();
      return savedRegistrationCode._id;

    } catch (err) {
      logger.error("Error creating registartionCode: " + err.message)
      throw err;
    }
  }

  static async createCourse(courseId, creator) {
    try {
      const course = new Course({ courseId, creator, });
      const savedCourse = await course.save();
      return savedCourse._id;
    } catch (err) {
      logger.error("Error creating course: " + err.message)
      throw err;
    }
  }
}

module.exports = MongoCreateData;
