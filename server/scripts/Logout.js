const MongoGetData = require("../database/mongo_get_data")
const MongoDeleteData = require("../database/mongo_delete_data")

async function UserLogout(userId) {
    const logoutTask = (async () => {
        let session = await MongoGetData.getSession({ userId: userId })

        while (session) {
            await MongoDeleteData.deleteSession(session._id)
            session = await MongoGetData.getSession({ userId: userId })
        }
        return true;
    })();

    const timeoutTask = new Promise(resolve => {
        setTimeout(() => resolve(false), 3000)
    })

    return Promise.race([logoutTask, timeoutTask])
}

module.exports = UserLogout;