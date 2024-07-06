
const mongoose = require("mongoose");

const dbUrl = "mongodb+srv://azam-project1:azam0315@back-end-development.qy3ydsz.mongodb.net/?retryWrites=true&w=majority&appName=Back-End-Development";

const dbName = "Quizapp";


const connectMongo = async () => {
    try {
        const isconnected = await mongoose.connect(
            dbUrl,
            { dbName: dbName },
        )
        isconnected && console.log("Mongo Db Connected Successfully!")

    }
    catch (error) {
        console.log(`Somethin went wrong while connecting dataBase ${error}`);
    }
}

module.exports = connectMongo;