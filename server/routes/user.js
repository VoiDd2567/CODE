const express = require("express");
const router = express.Router();
const MongoGetData = require("../database/mongo_get_data");
const MongoDeleteData = require("../database/mongo_delete_data");
const MongoUpdateData = require("../database/mongo_update_data");
const { safeUser } = require("../scripts/SafeTemplates");
const logger = require("../scripts/Logging");


router.get("/user", async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        if (!sessionId) {
            return res.status(401).json({ user: null, lng: null });
        }
        if (sessionId) {
            const session = await MongoGetData.getSession({ sessionId: sessionId })

            if (session.userId) {
                const user = await MongoGetData.getUser({ _id: session.userId })
                if (user) {
                    const safeUserTemplate = safeUser(user)
                    res.status(200).json({ user: safeUserTemplate, lng: session.lng })
                } else {
                    await MongoDeleteData.deleteSession(session._id)
                    res.status(401).json({ user: null, lng: null })
                }
            } else {
                res.status(401).json({ user: null, lng: null })
            }
        }
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }

})

router.post("/lng", async (req, res) => {
    try {
        const { lng } = req.body;
        const sessionId = req.cookies.sessionId;
        await MongoUpdateData.update("session", { sessionId: sessionId }, { lng: lng })

        const session = await MongoGetData.getSession({ sessionId: sessionId })
        await MongoUpdateData.update("user", { _id: session.userId }, { defaultLng: lng })
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

module.exports = router;