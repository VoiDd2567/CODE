const User = require("./schemas/User");
const SchoolClass = require("./schemas/SchoolClass");
const Exercise = require("./schemas/Exercise");
const ExerciseSolution = require("./schemas/ExerciseSolution");
const Session = require("./schemas/Session");
const RegistrationCode = require("./schemas/RegistrationCode")
const Course = require("./schemas/Course")
const coloredText = require("../console_colors");

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

  static async getUserBySession(sessionId) {
    const session = await this.#getData("session", { sessionId: sessionId })
    return await this.#getData("user", { _id: session.userId });
  }

  static async #getData(collectionType, findBy) {
    try {
      const model = {
        user: User,
        schoolclass: SchoolClass,
        exercise: Exercise,
        exerciseSolution: ExerciseSolution,
        session: Session,
        registrationCode: RegistrationCode,
        course: Course
      }[collectionType];

      const data = await model.findOne(findBy);
      if (!data) {
        return null;
      }
      return data;
    } catch (err) {
      console.error(coloredText("FAILED : Error finding data: " + err.message, "red"));
      throw err;
    }
  }
}

module.exports = MongoGetData;
