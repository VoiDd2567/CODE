const mongoose = require("mongoose");
const config = require("../config");
const coloredText = require("../console_colors");

const URI = config["MONGO_URI"];
const DATABASE_NAME = config["DATABASE_NAME"];

async function connect() {
  try {
    await mongoose.connect(URI, { dbName: DATABASE_NAME, autoIndex: true });
    console.log(coloredText("SUCCESS : Mongo connection succeeded", "green", true));
  } catch (err) {
    console.log(coloredText("FAILED : Mongo connection failed", "red", true));
    throw err;
  }
}


module.exports = connect;
