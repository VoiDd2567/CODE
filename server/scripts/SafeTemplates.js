function safeUser(user) {
    try {
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
            files: user.userFiles
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


module.exports = { safeUser, safeRegistrationCode };