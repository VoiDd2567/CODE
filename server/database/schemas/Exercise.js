const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: Map, of: String, required: true },
  creatorId: { type: String, default: "no-creator" },
  files: { type: Object, default: { "text.txt": "#" } },
  codeLng: { type: String, default: "py" },
  autoCheck: { type: Boolean, default: true },
  exerciseType: { type: String, default: "outputCheck" },
  completeSolution: { type: String, default: "" },
  checksFile: { type: String, default: "" },
  funcName: { type: String, default: "no-func" },
  minimalPercent: { type: Number, default: 100 },
});

exerciseSchema.statics.blockedFields = ["_id", "__v"];

module.exports = mongoose.model("exercise", exerciseSchema);