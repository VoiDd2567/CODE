const mongoose = require("mongoose");

const exerciseSolutionSchema = new mongoose.Schema({
  exerciseId: { type: String, required: true },
  studentId: { type: String, require: true },
  solutionFiles: { type: Object, default: null },
  answer: { type: String, default: null },
  anserCorrect: { type: Boolean, default: null },
});

exerciseSolutionSchema.statics.blockedFields = ["_id", "__v", "exerciseId", "studentId"];

module.exports = mongoose.model("exerciseSolution", exerciseSolutionSchema);