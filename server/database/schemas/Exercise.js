const mongoose = require("mongoose");
const config = require("../../config")

const exerciseSchema = new mongoose.Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: Map, of: String, required: true },
  files: { type: Object, required: true },
  programmingLng: { type: String, default: "python" },
  answer: { type: String, default: "no-answer" },
  creator: { type: String, default: config["DEFAULT_CREATOR"] },
  choises: { type: [String], defalt: [] }
});

exerciseSchema.statics.blockedFields = ["_id", "__v"];

module.exports = mongoose.model("exercise", exerciseSchema);