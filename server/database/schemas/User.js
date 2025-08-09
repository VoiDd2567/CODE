const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  weight: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, default: "" },
  defaultLng: { type: String, default: "est" },
  schoolClass: { type: String, default: "Not specified" },
  accessedCourses: { type: [String], default: [] },
  allowedExercises: { type: [String], default: [] },
  solutions: { type: [String], default: [] },
  madeCourses: { type: [String], default: [] },
  solvedExercises: { type: String, default: 0 },
  nameIsMutable: { type: Boolean, default: true },
  userFiles: { type: Object, default: { "main.py": "#Write you code here" , "text.txt" : "Write your text here"} },
  createdAt: { type: Date, default: Date.now }
});

userSchema.statics.blockedFields = ["_id", "__v", "createdAt", "weight"];

module.exports = mongoose.model("users", userSchema);