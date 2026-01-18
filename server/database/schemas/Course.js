const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    creator: { type: String, required: true },
    courseAccessId: { type: String, require: true },
    courseExercises: { type: [String], default: [] },
    accessedUsers: { type: [String], default: [] },
    courseCodeLng: { type: String, defaule: "" },
    createdAt: { type: Date, default: Date.now }
});

courseSchema.statics.blockedFields = ["_id", "__v", "createdAt", "courseAccessId"];

module.exports = mongoose.model("course", courseSchema);