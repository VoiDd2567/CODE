const logger = require("../scripts/Logging")
const User = require("./schemas/User");
const SchoolClass = require("./schemas/SchoolClass");
const Exercise = require("./schemas/Exercise");
const ExerciseSolution = require("./schemas/ExerciseSolution");
const Session = require("./schemas/Session");
const RegistrationCode = require("./schemas/RegistrationCode")
const Course = require("./schemas/Course")
const { deleteCache } = require("./cache/MongoCache")

class MongoUpdateData {
  static async update(modelName, updateParameter, updateData) {
    try {
      const mapping = {
        user: [User, deleteCache.deleteUser],
        schoolclass: [SchoolClass, deleteCache.deleteClass],
        exercise: [Exercise, deleteCache.deleteExercise],
        solution: [ExerciseSolution, deleteCache.deleteExerciseSolution],
        session: [Session, deleteCache.deleteSession],
        registrationCode: [RegistrationCode, deleteCache.deleteRegistrationCode],
        course: [Course, deleteCache.deleteCourse]
      };

      const tuple = mapping[modelName];
      if (!tuple) throw new Error(`Unknown model name: ${modelName}`);

      const [model, delCache] = tuple;

      this.#checkKeys(updateData, model, model.blockedFields || []);
      const item = await model.findOne(updateParameter);
      if (item) delCache(item);
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
