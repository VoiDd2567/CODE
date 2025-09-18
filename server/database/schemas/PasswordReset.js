const mongoose = require("mongoose");

const resetSchema = new mongoose.Schema({
    token: { type: String, required: true },
    userId: { type: String, default: null },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60
    }
});

resetSchema.statics.blockedFields = ["_id", "__v", "userId", , "token", "createdAt"];

module.exports = mongoose.model("passwordReset", resetSchema);