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
const { safeUser, safeRegistrationCode } = require("./scripts/SafeTemplates")
const RegistartionDataChecks = require("./scripts/RegistrationDataChecks")
const EmailSend = require("./scripts/EmailSend");
const Hash = require("./scripts/Hash")
const logger = require("./scripts/Logging")

const ContainerManagerImport = require("./codeProcessing/ContainerManager");
const PythonRender = require("./codeProcessing/python/PythonRender")

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, wait some time.'
})

const RegLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 5,
    message: 'Too many registration attempts, please try again later.'
});

const app = express();
app.use(cors({
    origin: 'https://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(limiter)
//app.set('trust proxy', true); Set on for cloudflare

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
        logger.error(err)
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
const ContainerManager = new ContainerManagerImport();

app.get("/api/user", async (req, res) => {
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

app.post("/api/lng", async (req, res) => {
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

app.post('/api/login', async (req, res) => {
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


app.post("/api/registration", RegLimiter, async (req, res) => {
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
            await EmailSend.sendRegistartionCode(email, username, code.code, lng);
        }

        res.status(200).json({ message: "Success" });
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }

})

app.get("/api/reg-code-time", async (req, res) => {
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

app.post("/api/check-reg-code", async (req, res) => {
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

app.get("/api/logout", async (req, res) => {
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

app.get("/api/get-exercises", requireAuth, async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const user = await MongoGetData.getUserBySession(sessionId)
        const allowedExercises = await getUsersAllowedExercises(user, true);

        res.status(200).json({ exerciseList: allowedExercises })
    } catch (err) {
        logger.error(err)
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
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
});


app.post("/api/save-code", requireAuth, async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const { type, name, value, exerciseId } = req.body;
        const user = await MongoGetData.getUserBySession(sessionId)

        if (type === "user") {
            if (name in user.userFiles) {
                const userFiles = user.userFiles;
                userFiles[name] = value;
                await MongoUpdateData.update("user", { _id: user._id }, { userFiles: userFiles })
                res.status(200).json({ success: true })
            } else {
                res.status(404).json({ error: "File not found" })
            }
        }
        if (type === "exercise") {
            if (exerciseId) {
                const exercise = await MongoGetData.getExercise({ _id: exerciseId })
                if (exercise) {
                    if (name.endsWith(".py") || name.endsWith(".js")) {
                        const user = await MongoGetData.getUserBySession(sessionId)
                        const solution = await MongoGetData.getExerciseSolution({ exerciseId: exerciseId, studentId: user._id })
                        if (!solution) {
                            await MongoCreateData.createExerciseSolution(exerciseId, value, user._id);
                            res.status(200).json({ success: true });
                        } else {
                            await MongoUpdateData.update("solution", { _id: solution._id }, { answer: value })
                            res.status(200).json({ success: true });
                        }
                    }
                }
            } else {
                res.status(404).json({ error: "Exercise not found" })
            }
        }

    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.post("/api/render-code", requireAuth, async (req, res) => {
    try {
        const { files, mainFile, fileType } = req.body;

        const formatedFiles = Object.entries(files).map(([filename, content]) => ({
            filename,
            content
        }));

        if (fileType === "py") {
            const mainCode = formatedFiles.find(f => f.filename === mainFile)?.content;
            const container = new PythonRender(mainCode, formatedFiles);
            ContainerManager.add(container.id, container);
            try {
                const output = await container.runCode();
                if (output.status == "complete") {
                    return res.status(200).json({ output: output, waiting_for_input: false, complete: true })
                }
                if (output.status == "waiting_for_input") {
                    return res.status(201).json({ output: output, waiting_for_input: true, complete: false, code_id: container.id })
                }
                throw new Error("Code didn't run")
            } catch (err) {
                logger.error("Failed to run container : " + err)
                return res.status(400).json({ error: "Failed to run code" })
            }
        } else {
            res.status(400).json({ error: "Can't run this file" })
        }
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.post("/api/send-input", requireAuth, async (req, res) => {
    try {
        const { id, input } = req.body;
        if (typeof input !== "string" || input.length > 1000) {
            return res.status(400).json({ error: "Invalid input" });
        }
        if (typeof id !== "string" || !/^[a-zA-Z0-9_-]+$/.test(id)) {
            return res.status(400).json({ error: "Invalid ID" });
        }
        const sanitizedInput = input.replace(/[\x00-\x1F\x7F]/g, "");

        const container = ContainerManager.getContainer(id);
        const output = await container.addInput(sanitizedInput);

        if (output.status == "complete") {
            return res.status(200).json({ output: output, waiting_for_input: false, complete: true })
        }
        if (output.status == "waiting_for_input") {
            return res.status(201).json({ output: output, waiting_for_input: true, complete: false, code_id: container.id })
        }
        throw new Error("Code failed to complete")
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.post("/api/check-exercise", requireAuth, async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const { exerciseId } = req.body;

    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

https.createServer(options, app).listen(PORT, () => {
    console.log(`HTTPS server working on ${PORT}`);
});