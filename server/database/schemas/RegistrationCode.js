const mongoose = require("mongoose");

const registrationCodeSchema = new mongoose.Schema({
    sessionId: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    code: { type: String, required: true },
    attempts: { type: Number, default: 10 },
    codeExpires: { type: Date, default: null },
    newCodeSend: { type: Date, default: null },
    weight: { type: String, default: "student" },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 10
    }
});

registrationCodeSchema.statics.blockedFields = ["_id", "__v", "sessionId", "username", "password", "email", "createdAt"];

module.exports = mongoose.model("registrationCode", registrationCodeSchema);