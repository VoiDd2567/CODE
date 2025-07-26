const config = require("../config")
const nodemailer = require("nodemailer")
const fs = require("fs")
const path = require("path");

const GMAIL_APP_PASSWORD = config["GMAIL_APP_PASSWORD"]
const GMAIL = config["GMAIL"]

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: GMAIL,
        pass: GMAIL_APP_PASSWORD
    }
});

class EmailSend {
    static async sendRegistartionCode(email, name, code, lng) {
        const html = await this.#generateRegistartionCodeEmail(name, code, lng);
        const subject = lng == "eng" ? "Registartion code" : "Registreerimiskood";
        transporter.sendMail({
            from: `"Code Team" <${GMAIL}>`,
            to: email,
            subject: subject,
            html: html,
            attachments: [{
                filename: 'logo.jpg',
                path: "./public/pictures/logo.png",
                cid: 'unique@cid'
            }]

        })
    }

    static async #generateRegistartionCodeEmail(name, code, lng) {
        const filePath = path.join(__dirname, "..", "public", "html", lng === "eng" ? "email_eng.html" : "email_est.html");
        let file = await fs.promises.readFile(filePath, "utf-8")
        let html = file.replace("{{username}}", name).replace("{{code}}", code)
        return html
    }
}

module.exports = EmailSend;