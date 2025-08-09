const mongoose = require("mongoose");
const config = require("../config");
const logger = require("../scripts/Logging")

const URI = config["MONGO_URI"];
const DATABASE_NAME = config["DATABASE_NAME"];

async function connect() {
  try {
    await mongoose.connect(URI, { dbName: DATABASE_NAME, autoIndex: true });
    logger.info("SUCCESS : Mongo connection succeeded")
  } catch (err) {
    logger.error("FAILED : Mongo connection failed : " + err)
    throw err;
  }
}


module.exports = connect;
