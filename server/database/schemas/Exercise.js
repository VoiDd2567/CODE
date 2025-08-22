const mongoose = require("mongoose");
const config = require("../../config")

const exerciseSchema = new mongoose.Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: Map, of: String, required: true },
  creator: { type: String, default: config["DEFAULT_CREATOR"] },
  files: { type: Object, required: true },
  programmingLng: { type: String, default: "python" },
  autoCheck: { type: Boolean, default: false },
  answerCheckType: { type: String, default: "no-answer-check" },
  inputAnswers: { type: Object, default: {} },
  inputCount: { type: Number, default: 0 },
  withoutInputAnswer: { type: String, default: "has-input" },
  functionName: { type: String, default: "no-func" },
  functionReturns: { type: Object, default: {} },
  choiceAnswer: { type: String, default: "no-choice-answer" },
  choises: { type: [String], default: [] }
});

exerciseSchema.statics.blockedFields = ["_id", "__v"];

module.exports = mongoose.model("exercise", exerciseSchema);