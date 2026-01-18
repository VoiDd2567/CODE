const config = require("../config")
const nodemailer = require("nodemailer")
const fs = require("fs")
const path = require("path");
const logger = require("./Logging");

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
        try {
            const html = await this.#generateRegistartionCodeEmail(name, code, lng);
            const subject = lng == "eng" ? "Registartion code" : "Registreerimiskood";

            await transporter.sendMail({
                from: `"Code Team" <${GMAIL}>`,
                to: email,
                subject: subject,
                html: html,
                attachments: [{
                    filename: '/logo.png',
                    path: "./public/pictures/logo.png",
                    cid: 'unique@cid'
                }]
            });

            return true;
        } catch (err) {
            logger.error("Error while sending Email:", err);
            return false;
        }
    }

    static async #generateRegistartionCodeEmail(name, code, lng) {
        try {
            const filePath = path.join(__dirname, "..", "public", "html", lng === "eng" ? "reg_email_eng.html" : "reg_email_est.html");
            let file = await fs.promises.readFile(filePath, "utf-8");
            let html = file.replace("{{username}}", name).replace("{{code}}", code);
            return html;
        } catch (err) {
            logger.error("Error generating email HTML:", err);
            return "";
        }
    }

    static async sendResetLink(email, link, lng) {
        try {
            const html = await this.#generateResetEmail(link, lng);
            const subject = lng == "eng" ? "Password reset" : "Parooli uuendamine";

            await transporter.sendMail({
                from: `"Code Team" <${GMAIL}>`,
                to: email,
                subject: subject,
                html: html,
                attachments: [{
                    filename: '/logo.png',
                    path: "./public/pictures/logo.png",
                    cid: 'unique@cid'
                }]
            });

            return true;
        } catch (err) {
            logger.error("Error while sending Email:", err);
            return false;
        }
    }

    static async #generateResetEmail(link, lng) {
        try {
            const filePath = path.join(__dirname, "..", "public", "html", lng === "eng" ? "reset_email_eng.html" : "reset_email_est.html");
            let file = await fs.promises.readFile(filePath, "utf-8");
            let html = file.replace("{{link}}", link);
            return html;
        } catch (err) {
            logger.error("Error generating email HTML:", err);
            return "";
        }
    }
}


module.exports = EmailSend;