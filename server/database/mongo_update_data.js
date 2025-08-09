const logger = require("../scripts/Logging")
const User = require("./schemas/User");
const SchoolClass = require("./schemas/SchoolClass");
const Exercise = require("./schemas/Exercise");
const ExerciseSolution = require("./schemas/ExerciseSolution");
const Session = require("./schemas/Session");
const RegistrationCode = require("./schemas/RegistrationCode")
const Course = require("./schemas/Course")


class MongoUpdateData {
  static async update(modelName, updateParameter, updateData) {
    try {
      const models = {
        user: User,
        schoolclass: SchoolClass,
        exercise: Exercise,
        solution: ExerciseSolution,
        session: Session,
        registrationCode: RegistrationCode,
        course: Course
      };

      const model = models[modelName];
      this.#checkKeys(updateData, model, model.blockedFields || []);
      await model.updateOne(updateParameter, { $set: updateData });
    } catch (err) {
      logger.error(`FAILED : ${err.message}`);
      throw err;
    }
  }

  static #checkKeys(updateObj, model, disallowedKeys) {
    const schemaPaths = Object.keys(model.schema.paths);
    const allowedFields = schemaPaths.filter(field => !disallowedKeys.includes(field));

    const updateFields = Object.keys(updateObj);
    const invalidFields = updateFields.filter(field => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      logger.error(`FAILED : Invalid keys - ${invalidFields}`);
      throw new Error("Invalid keys");
    }
  }
}

module.exports = MongoUpdateData;
