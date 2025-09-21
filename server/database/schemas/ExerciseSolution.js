const mongoose = require("mongoose");

const exerciseSolutionSchema = new mongoose.Schema({
  exerciseId: { type: String, required: true },
  userId: { type: String, require: true },
  solutionFiles: { type: Object, default: null },
  solution: { type: String, default: null },
  completeAnswer: { type: Boolean, default: false },
  answerCorrectPercent: { type: Number, default: null }
});

exerciseSolutionSchema.statics.blockedFields = ["_id", "__v", "exerciseId", "userId"];

module.exports = mongoose.model("exerciseSolution", exerciseSolutionSchema);