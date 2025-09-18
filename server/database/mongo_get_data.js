const User = require("./schemas/User");
const SchoolClass = require("./schemas/SchoolClass");
const Exercise = require("./schemas/Exercise");
const ExerciseSolution = require("./schemas/ExerciseSolution");
const Session = require("./schemas/Session");
const RegistrationCode = require("./schemas/RegistrationCode")
const Course = require("./schemas/Course")
const PasswordReset = require("./schemas/PasswordReset")
const logger = require("../scripts/Logging")
const { getCache, setCache } = require("./cache/MongoCache")


class MongoGetData {
  static async getUser(findBy) {
    return await this.#getData("user", findBy);
  }

  static async getClass(findBy) {
    return await this.#getData("schoolclass", findBy);
  }

  static async getExercise(findBy) {
    return await this.#getData("exercise", findBy)
  }

  static async getExerciseSolution(findBy) {
    return await this.#getData("exerciseSolution", findBy)
  }

  static async getSession(findBy) {
    return await this.#getData("session", findBy)
  }

  static async getRegistrationCode(findBy) {
    return await this.#getData("registrationCode", findBy)
  }

  static async getCourse(findBy) {
    return await this.#getData("course", findBy)
  }

  static async getPasswordReset(findBy) {
    return await this.#getData("passwordReset", findBy)
  }

  static async getUserBySession(sessionId) {
    const session = await this.#getData("session", { sessionId: sessionId })
    return await this.#getData("user", { _id: session.userId });
  }

  static async #getData(collectionType, findBy) {
    try {
      const [model, getFn, ttl] = {
        user: [User, getCache.getUser, 86400],
        schoolclass: [SchoolClass, getCache.getClass, 86400],
        exercise: [Exercise, getCache.getExercise, 43200],
        exerciseSolution: [ExerciseSolution, getCache.getExerciseSolution, 3600],
        session: [Session, getCache.getSession, 3600],
        registrationCode: [RegistrationCode, getCache.getRegistrationCode, 600],
        course: [Course, getCache.getCourse, 86400],
        passwordReset: [PasswordReset, null, null]
      }[collectionType];
      let cache;
      if (collectionType != "passwordReset") {
        cache = await getFn.call(getCache, findBy);
        if (typeof cache === "object") {
          return cache;
        }
      }

      const data = await model.findOne(findBy);
      if (!data) return null;

      if (collectionType != "passwordReset") {
        await setCache.set(cache, data, ttl);
      }
      return data;
    } catch (err) {
      logger.error("FAILED : Error finding data: " + err.message);
      throw err;
    }
  }
}

module.exports = MongoGetData;
