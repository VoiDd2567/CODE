const mongoose = require("mongoose");

const exerciseSolutionSchema = new mongoose.Schema({
  exerciseId: { type: String, required: true },
  answer : {type : String, required : true},
  studentId : {type : String, require : true},
  anserCorrect : {type : Boolean, default : null}
});

exerciseSolutionSchema.statics.blockedFields = ["_id", "__v", "exerciseId", "answer", "studentId"];

module.exports = mongoose.model("exerciseSolution", exerciseSolutionSchema);