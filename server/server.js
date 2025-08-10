const express = require("express");
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const rateLimit = require("express-rate-limit");
const expressSession = require("express-session");

const mongoConnect = require("./database/mongo_connect");
const ContainerManagerImport = require("./codeProcessing/ContainerManager");

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, wait some time.'
})

const app = express();
app.use(cors({ origin: 'https://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(limiter);
//app.set('trust proxy', true); Set on for cloudflare

(async () => {
    await mongoConnect();
})();
app.use(require("./middlewares/session"));

app.use("/api/user", require("./routes/user"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/exercise", require("./routes/exercise"));
app.use("/api/code", require("./routes/code"));

const PORT = 3001;
const options = {
    key: fs.readFileSync('../server.key'),
    cert: fs.readFileSync('../server.cert')
};

https.createServer(options, app).listen(PORT, () => {
    console.log(`HTTPS server working on ${PORT}`);
});