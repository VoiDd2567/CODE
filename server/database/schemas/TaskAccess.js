const mongoose = require("mongoose");

const taskAccessSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

taskAccessSchema.statics.blockedFields = ["_id", "__v", "taskId", "userId", "createdAt"];

module.exports = mongoose.model("taskAccess", taskAccessSchema, "taskAccess");
