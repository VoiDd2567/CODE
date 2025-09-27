const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const MongoGetData = require("../database/mongo_get_data");
const MongoCreateData = require("../database/mongo_create_data");
const MongoUpdateData = require("../database/mongo_update_data");
const MongoDeleteData = require("../database/mongo_delete_data");

const { safeUser, safeRegistrationCode } = require("../scripts/SafeTemplates");
const RegistartionDataChecks = require("../scripts/RegistrationDataChecks");
const EmailSend = require("../scripts/EmailSend");
const Hash = require("../scripts/Hash");
const logger = require("../scripts/Logging");
const config = require("../config");
const crypto = require('crypto');

const RegLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 5,
    message: 'Too many registration attempts, please try again later.'
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const sessionId = req.cookies.sessionId;

        const user = await MongoGetData.getUser({ username: username })
        if (user == null) {
            res.status(401).json({ error: "Wrong username or password" });
            return
        }
        const passwordsSame = await Hash.compare(password, user.password)
        if (!passwordsSame) {
            res.status(401).json({ error: "Wrong username or password" });
            return
        }
        await MongoUpdateData.update("session", { sessionId: sessionId }, { userId: user._id, lng: user.defaultLng });

        const safeUserTemplate = safeUser(user)
        res.status(200).json({ user: safeUserTemplate });
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
});


router.post("/registration", RegLimiter, async (req, res) => {
    try {
        const { username, password, password_repeat, email, role, policy } = req.body;
        const sessionId = req.cookies.sessionId;

        const policyResult = RegistartionDataChecks.isPolicyAccepted(policy);
        if (!policyResult) return res.status(403).json({ error: "You must accept the terms of use" });

        const passwordsResult = RegistartionDataChecks.arePasswordsSame(password, password_repeat);
        if (!passwordsResult) return res.status(403).json({ error: "Passwords aren't the same" })

        const sameUsernameResult = await RegistartionDataChecks.isUsernameUsed(username);
        if (!sameUsernameResult) return res.status(403).json({ error: "This username is already in use" })

        const isValidEmailResult = RegistartionDataChecks.isValidEmail(email)
        if (!isValidEmailResult) return res.status(403).json({ error: "Please change email" })

        const sameEmailResult = await RegistartionDataChecks.isEmailUsed(email);
        if (!sameEmailResult) return res.status(403).json({ error: "This email is already in use" })

        const passwordValidResult = RegistartionDataChecks.passwordChecks(password)
        if (!passwordValidResult.valid) return res.status(403).json({ error: passwordValidResult.message })

        const hashedPassword = await Hash.hash(password);

        const session = await MongoGetData.getSession({ sessionId: sessionId });
        const lng = session.lng;

        const checkCode = await MongoGetData.getRegistrationCode({ email: email })
        let codeId;
        if (!checkCode) {
            codeId = await MongoCreateData.createRegistrationCode(sessionId, username, email, hashedPassword, role);
        } else {
            codeId = checkCode._id;
        }
        const code = await MongoGetData.getRegistrationCode({ _id: codeId })

        if (!checkCode) {
            try {
                await EmailSend.sendRegistartionCode(email, username, code.code, lng);
            } catch (err) {
                logger.error("FAILED: Failed to send email: " + err);
                res.status(500).json({ error: "Failed to send email" });
            }
        }
        res.status(200).json({ message: "Success" });
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }

})

router.get("/reg-code-time", async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;

        const registrationInfo = await MongoGetData.getRegistrationCode({ sessionId: sessionId });
        const safeInfo = safeRegistrationCode(registrationInfo);
        res.status(200).json({ data: safeInfo });
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
});


router.get("/get-new-reg-code", async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId
        const codeInfo = await MongoGetData.getRegistrationCode({ sessionId: sessionId });
        const now = new Date();
        const newCondSendTime = new Date(codeInfo.newCodeSend)

        if (newCondSendTime.getTime() <= now.getTime()) {
            const newCode = String(Math.floor(100000 + Math.random() * 900000));
            const newCodeExpires = new Date(Date.now() + 60 * 1000);
            await MongoUpdateData.update("registrationCode", { sessionId: sessionId }, { code: newCode, newCodeSend: newCodeExpires })

            const session = await MongoGetData.getSession({ sessionId: sessionId })
            const lng = session.lng;

            const sent = await EmailSend.sendRegistartionCode(codeInfo.email, codeInfo.username, newCode, lng);
            if (!sent) {
                return res.status(400).json({ error: "Couldn't send email" })
            }

            return res.status(200).json({ newCodeExpires: newCodeExpires })
        } else {
            return res.status(403).json({ error: "It's too early for a new code" })
        }

    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

router.post("/check-reg-code", async (req, res) => {
    try {
        const { code } = req.body
        const sessionId = req.cookies.sessionId;

        const regCode = await MongoGetData.getRegistrationCode({ sessionId: sessionId })
        if (regCode.code === String(code)) {
            const userId = await MongoCreateData.createUser(regCode.username, regCode.weight, regCode.password, regCode.email)
            await MongoUpdateData.update("session", { sessionId: sessionId }, { userId: userId })
            await MongoDeleteData.deleteRegistrationCode(regCode._id);
            return res.status(200).json({ message: "Success" })
        } else {
            const attempts = regCode.attempts
            if (regCode.attempts - 1 > 0) {
                await MongoUpdateData.update("registrationCode", { sessionId: sessionId }, { attempts: attempts - 1 })
                return res.status(400).json({ error: "Wrong code", redirect: false });
            } else {
                await MongoDeleteData.deleteRegistrationCode(regCode._id)
                return res.status(401).json({ error: "Too many wrong attempts, try registartion again", redirect: true })
            }
        }

    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

router.get("/logout", async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const session = await MongoGetData.getSession({ sessionId: sessionId })
        await MongoDeleteData.deleteSession(session._id)
        res.status(200).json({ success: true })
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

router.post("/send-reset-link", RegLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        console.log
        if (typeof email != "string") {
            return res.status(401).json({ error: "Wrong data type" })
        }

        const user = await MongoGetData.getUser({ email: email });
        if (user) {
            const sentCheck = await MongoGetData.getPasswordReset({ userId: user._id });
            if (!sentCheck) {
                const token = crypto.randomBytes(32).toString("hex");
                const tokenHash = await Hash.hash(token);
                const resetLink = `${config["DOMAIN"]}/reset-password?uid=${user._id}&token=${token}`;

                await MongoCreateData.createPasswordReset(tokenHash, user._id);
                await EmailSend.sendResetLink(email, resetLink, user.defaultLng);
                return res.status(200).json({ success: "true" })
            }
            return res.status(429).json({ error: "Email already sent" })
        }

    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

router.post("/check-reset-token", async (req, res) => {
    try {
        const { token, userId } = req.body;

        const reset = await MongoGetData.getPasswordReset({ userId: userId })
        if (!reset) {
            return res.status(401).json({ error: "Reset process not found" })
        }

        const compare = await Hash.compare(token, reset.token)

        if (compare) {
            return res.status(200).json({ message: "Right token" })
        }

        return res.status(401).json({ error: "Reset process not found" })
    }
    catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

router.post("/reset-password", RegLimiter, async (req, res) => {
    try {
        const { token, password, userId } = req.body;

        const passwordValidResult = RegistartionDataChecks.passwordChecks(password)
        if (!passwordValidResult.valid) return res.status(403).json({ error: passwordValidResult.message })

        const reset = await MongoGetData.getPasswordReset({ userId: userId })
        if (!reset) {
            return res.status(401).json({ error: "Reset process not found" })
        }

        const compare = await Hash.compare(token, reset.token)
        if (compare) {
            const hashedPassword = await Hash.hash(password);
            await MongoUpdateData.update("user", { _id: userId }, { password: hashedPassword, passwordChangedAt: new Date() })
            await MongoDeleteData.deletePasswordReset(reset._id);
            return res.status(200).json({ message: "Password changed" })
        }

        return res.status(401).json({ error: "Reset process not found" })
    }
    catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

module.exports = router;