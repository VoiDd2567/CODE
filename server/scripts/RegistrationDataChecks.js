const MongoGetData = require("../database/mongo_get_data");

class RegistartionDataChecks {

    static isPolicyAccepted(policy) {
        if (!policy) {
            return false
        } return true
    }

    static arePasswordsSame(password, password_repeat) {
        if (password !== password_repeat) {
            return false
        } return true
    }

    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static async isUsernameUsed(username) {
        const findSameUsername = await MongoGetData.getUser({ username: username })
        if (findSameUsername) {
            return false
        } return true
    }

    static async isEmailUsed(email) {
        const findSameEmail = await MongoGetData.getUser({ email: email })
        if (findSameEmail) {
            return false
        } return true
    }

    static passwordChecks(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const noSpaces = !/\s/.test(password);

        if (password.length < minLength) {
            return { valid: false, message: "Minimum amount of characters in password is 8" };
        }
        if (!hasUpperCase) {
            return { valid: false, message: "Password needs to have upper case" };
        }
        if (!hasNumber) {
            return { valid: false, message: "Password needs to have number" };
        }
        if (!hasSpecialChar) {
            return { valid: false, message: "Password needs to have special character" };
        }
        if (!noSpaces) {
            return { valid: false, message: "Password can't have spaces in it" };
        }

        return { valid: true, message: "Valid password" };
    }


}




module.exports = RegistartionDataChecks