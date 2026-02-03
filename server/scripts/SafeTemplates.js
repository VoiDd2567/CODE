const MongoGetData = require("../database/mongo_get_data");

function safeUser(user) {
    try {
        const passwordLastChanged = new Date(user.passwordChangedAt);
        return {
            weight: user.weight,
            username: user.username,
            email: user.email,
            name: user.name,
            defaultLng: user.defaultLng,
            nameIsMutable: user.nameIsMutable,
            files: user.userFiles,
            passwordLastChanged: passwordLastChanged.toLocaleString()
        }
    } catch (err) {
        return "Unavailable to read user"
    }

}

function safeRegistrationCode(regCode) {
    try {
        return {
            email: regCode.email,
            codeExpires: regCode.codeExpires,
            newCodeSend: regCode.newCodeSend
        }
    } catch (err) {
        return "Unvailable to read code inforamtion"
    }
}

function safeCourse(course) {
    try {
        return {
            id: course._id,
            name: course.name,
            author: course.creator,
            content: course.content,
            codeLng: course.courseCodeLng
        }
    } catch (err) {
        return "Unvailable to read course inforamtion"
    }
}

function safeExercise(ex) {
    try {
        return {
            name: ex.name,
            description: ex.description,
            files: ex.files,
            codeLng: ex.codeLng,
            autoCheck: ex.autoCheck,
            exerciseType: ex.exerciseType,
            completeSolution: ex.completeSolution,
            checksFile: ex.checksFile,
            funcName: ex.funcName,
            minimalPercent: ex.minimalPercent
        }
    } catch (err) {
        return "Unvailable to read exercise inforamtion"
    }
}

function isSafeExercise(ex) {
    const allowedKeys = ["name", "description", "files",
        "codeLng", "autoCheck", "exerciseType", "completeSolution",
        "checksFile", "funcName", "minimalPercent"]

    const requiredKeys = ["name", "description", "codeLng"]

    const hasOnlyAllowedKeys = Object.keys(ex).every(element => allowedKeys.includes(element));
    if (!hasOnlyAllowedKeys) {
        return false;
    }
    const hasAllRequiredKeys = requiredKeys.every(key => key in ex);
    if (!hasAllRequiredKeys) {
        return false;
    }

    return true;
}


module.exports = { safeUser, safeRegistrationCode, safeCourse, isSafeExercise, safeExercise };