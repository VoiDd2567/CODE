const mongoose = require("mongoose");
const fs = require("fs");
const config = require("../config");
const logger = require("../scripts/Logging");

const URI = config["MONGO_URI"];
const DATABASE_NAME = config["DATABASE_NAME"];

async function connect() {
  try {
    await mongoose.connect(URI, { dbName: DATABASE_NAME, autoIndex: true });
    logger.info("SUCCESS : Mongo connection succeeded");
  } catch (err) {
    const errorMessage = "FAILED : Mongo connection failed : " + err;
    
    logger.error(errorMessage);

    fs.appendFile("errors.txt", errorMessage + "\n", (fsErr) => {
      if (fsErr) {
        console.error("Failed to write error to file:", fsErr);
      }
    });

    throw err;
  }
}

module.exports = connect;
