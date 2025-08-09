const bcrypt = require("bcrypt");
const config = require("../config")

saltRounds = config["SALT_ROUNDS"]

class Hash {
    static async hash(item) {
        const hashed = await bcrypt.hash(item, saltRounds);
        return hashed;
    }

    static async compare(item1, hash) {
        const isSame = await bcrypt.compare(item1, hash);
        return isSame;
    }
}

module.exports = Hash;