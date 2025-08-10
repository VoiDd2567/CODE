const PythonRender = require("./PythonRender");
const MongoGetData = require("../../database/mongo_get_data");
const MongoUpdateData = require("../../database/mongo_update_data");

// Exercise types - choose 1 from list
//                  choose 1 from 2
//                  check code output
//                  check code function output

// Mb it's good to add check many from list

//NB! It checks by USER SOLUTION. It takes it from db so before checking there has to be user solution writen in db
class ExerciseCheck { // Class that takes an exercise solution and runs pre-given instructions on which base it decides is exercise done correctly or not
    constructor(exerciseId, userId) {
        this.exerciseId = exerciseId;
        this.userId = userId;

    }
};

module.exports = ExerciseCheck;