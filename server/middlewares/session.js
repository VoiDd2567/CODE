const { v4: uuidv4 } = require("uuid");
const MongoGetData = require("../database/mongo_get_data");
const MongoCreateData = require("../database/mongo_create_data");
const logger = require("../scripts/Logging");

module.exports = async (req, res, next) => {
    try {
        let sessionId = req.cookies.sessionId;
        if (!sessionId) {
            sessionId = uuidv4();
            await MongoCreateData.createSession(sessionId);
            res.cookie("sessionId", sessionId, {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });
        } else {
            const session = await MongoGetData.getSession({ sessionId });
            if (!session) {
                await MongoCreateData.createSession(sessionId);
            }
        }
        req.sessionId = sessionId;
        next();
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};
