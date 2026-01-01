function safeUser(user) {
    try {
        const passwordLastChanged = new Date(user.passwordChangedAt);
        return {
            username: user.username,
            email: user.email,
            name: user.name,
            defaultLng: user.defaultLng,
            schoolClass: user.schoolClass,
            accessedCourses: user.accessedCourses,
            allowedExercises: user.allowedExercises,
            solutions: user.solutions,
            madeCourses: user.madeCourses,
            solvedExercises: user.solvedExercises,
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
    const allowedKeys = ["type", "name", "description", "files",
        "programmingLng", "autoCheck", "answerCheckType", "inputAnswers",
        "inputCount", "withoutInputAnswer", "functionName", "functionReturns",
        "minimalPercent"]

    const requiredKeys = ["name", "description", "programmingLng"]

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

module.exports = { safeUser, safeRegistrationCode, safeCourse, safeExercise };