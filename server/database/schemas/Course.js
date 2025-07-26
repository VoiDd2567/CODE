const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    creator: { type: String, required: true },
    textInPages: { type: [String], default: [] },
    courseExercises: { type: [String], default: [] },
    accessedUsers: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now }
});

courseSchema.statics.blockedFields = ["_id", "__v", "createdAt"];

module.exports = mongoose.model("course", courseSchema);