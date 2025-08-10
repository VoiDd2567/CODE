const mongoose = require("mongoose");

const exerciseSolutionSchema = new mongoose.Schema({
  exerciseId: { type: String, required: true },
  userId: { type: String, require: true },
  solutionFiles: { type: Object, default: null },
  answer: { type: String, default: null },
  files: { type: Object, default: {} },
  completeAnswer: { type: Boolean, default: null },
  anserCorrect: { type: Boolean, default: null },
});

exerciseSolutionSchema.statics.blockedFields = ["_id", "__v", "exerciseId", "userId"];

module.exports = mongoose.model("exerciseSolution", exerciseSolutionSchema);