const express = require("express");
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require("express-rate-limit");
const expressSession = require("express-session");

const mongoConnect = require("./database/mongo_connect");
const MongoGetData = require("./database/mongo_get_data");
const MongoCreateData = require("./database/mongo_create_data");
const MongoUpdateData = require("./database/mongo_update_data");
const MongoDeleteData = require("./database/mongo_delete_data");

const { getUsersAllowedExercises, requireAuth } = require("./scripts/SecurityChecks")
const { safeUser, safeRegistartionCode } = require("./scripts/SafeTemplates")
const RegistartionDataChecks = require("./scripts/RegistrationDataChecks")
const EmailSend = require("./scripts/EmailSend");

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, wait some time.'
})

const app = express();
app.use(cors({
    origin: 'https://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(limiter)

app.use(async (req, res, next) => {
    try {
        let sessionId = req.cookies.sessionId;

        if (!sessionId) {
            sessionId = uuidv4();
            await MongoCreateData.createSession(sessionId);
            res.cookie("sessionId", sessionId, {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                maxAge: 30 * 24 * 60 * 60 * 1000 //30 days
            })
        } else {
            const session = await MongoGetData.getSession({ sessionId: sessionId })
            if (!session) {
                await MongoCreateData.createSession(sessionId);
            }
        }

        req.sessionId = sessionId;
        next()
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Internal server error" })
    }
});

(async () => {
    await mongoConnect();
})();

const PORT = 3001;
const options = {
    key: fs.readFileSync('../server.key'),
    cert: fs.readFileSync('../server.cert')
};

app.get("/api/user", async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
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
        console.log(err)
        res.status(500).json({ error: "Internal server error" })
    }

})

app.post("/api/lng", async (req, res) => {
    try {
        const { lng } = req.body;
        const sessionId = req.cookies.sessionId;
        await MongoUpdateData.update("session", { sessionId: sessionId }, { lng: lng })

        const session = await MongoGetData.getSession({ sessionId: sessionId })
        await MongoUpdateData.update("user", { _id: session.userId }, { defaultLng: lng })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const sessionId = req.cookies.sessionId;

        const user = await MongoGetData.getUser({ username: username })
        if (user == null) {
            res.status(401).json({ error: "Wrong username or password" });
            return
        }
        if (user.password !== password) {
            res.status(401).json({ error: "Wrong username or password" });
            return
        }
        await MongoUpdateData.update("session", { sessionId: sessionId }, { userId: user._id, lng: user.defaultLng });

        const safeUserTemplate = safeUser(user)
        res.status(200).json({ user: safeUserTemplate });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Internal server error" })
    }
});


app.post("/api/registration", async (req, res) => {
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

        const codeId = await MongoCreateData.createRegistrationCode(sessionId, username, email, password, role);
        const code = await MongoGetData.getRegistrationCode({ _id: codeId })

        const session = await MongoGetData.getSession({ sessionId: sessionId });
        const lng = session.lng;

        await EmailSend.sendRegistartionCode(email, username, code.code, lng);

        res.status(200).json({ message: "Success" });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Internal server error" })
    }

})

app.get("/api/reg-code-time", async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;

        const registrationInfo = await MongoGetData.getRegistrationCode({ sessionId: sessionId });
        const safeInfo = safeRegistartionCode(registrationInfo);

        res.status(200).json({ data: safeInfo });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" })
    }
});


app.get("/api/get-new-reg-code", async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId
        const codeInfo = await MongoGetData.getRegistrationCode({ sessionId: sessionId });
        const now = new Date();
        if (codeInfo.newCodeSend <= now) {
            const newCode = String(Math.floor(100000 + Math.random() * 900000));
            const newCodeExpires = new Date(Date.now() + 60 * 1000);
            await MongoUpdateData.update("registrationCode", { sessionId: sessionId }, { code: newCode, newCodeSend: newCodeExpires })

            const session = await MongoGetData.getSession({ sessionId: sessionId })
            const lng = session.lng;

            await EmailSend.sendRegistartionCode(codeInfo.email, codeInfo.username, newCode, lng);

            return res.status(200).json({ newCodeExpires: newCodeExpires })
        } else {
            return res.status(403).json({ error: "It's too early for a new code" })
        }

    } catch (err) {
        res.status(500).json({ error: "Internal server error" })
    }
})

app.post("/api/check-reg-code", async (req, res) => {
    try {
        const { code } = req.body
        const sessionId = req.cookies.sessionId;

        const regCode = await MongoGetData.getRegistrationCode({ sessionId: sessionId })
        if (regCode.code === String(code)) {
            const userId = await MongoCreateData.createUser(regCode.username, regCode.weight, regCode.password, regCode.email)
            await MongoCreateData.createSession(sessionId, userId)
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
        res.status(500).json({ error: "Internal server error" })
    }
})

app.get("/api/logout", async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const session = await MongoGetData.getSession({ sessionId: sessionId })
        await MongoDeleteData.deleteSession(session._id)
        res.status(200).json({ success: true })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.get("/api/get-exercises", requireAuth, async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const user = await MongoGetData.getUserBySession(sessionId)
        const allowedExercises = await getUsersAllowedExercises(user, true);

        res.status(200).json({ exerciseList: allowedExercises })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.post("/api/get-exercise", requireAuth, async (req, res) => {
    try {
        const { exerciseId } = req.body;
        const exercise = await MongoGetData.getExercise({ _id: exerciseId });
        if (!exercise) {
            return res.status(404).json({ error: "No exercise found" })
        }

        const sessionId = req.cookies.sessionId;
        const user = await MongoGetData.getUserBySession(sessionId)
        const allowedExercises = await getUsersAllowedExercises(user);

        if (exerciseId in allowedExercises) {
            res.status(200).json({ exercise: exercise })
        } else {
            res.status(403).json({ error: "You don't have access to this exercise" })
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Internal server error" })
    }
});

app.post("/api/save-code", requireAuth, async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const { type, name, value } = req.body;
        const user = await MongoGetData.getUserBySession(sessionId)

        if (type === "user") {
            if (name in user.userFiles) {
                // You stopped here If name in userfiles then send the file. Mb do some checks idk, check that later
            } else {
                res.status(404).json({ error: "File not found" })
            }
        }

    } catch (err) {
        res.status(500).json({ error: "Internal server error" })
    }
})

https.createServer(options, app).listen(PORT, () => {
    console.log(`HTTPS server working on ${PORT}`);
});