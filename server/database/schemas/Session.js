const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  userId: { type: String, default: null },
  lng: { type: String, default: "est" },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 30
  }
});

sessionSchema.statics.blockedFields = ["_id", "__v", "sessionId", "createdAt"];

module.exports = mongoose.model("sessions", sessionSchema);