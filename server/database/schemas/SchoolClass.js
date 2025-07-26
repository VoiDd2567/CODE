const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teacher: { type: String, required: true },
  students : {type : [String], default : []},
  accessedCourses : {type : [Number] , default : []},
  createdAt: { type: Date, default: Date.now }
});

classSchema.statics.blockedFields = ["_id", "__v"];

module.exports = mongoose.model("schoolclass", classSchema);