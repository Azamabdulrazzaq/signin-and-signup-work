// Note mongo data base configuration file...!
const mongoose = require("mongoose");
const dbName = "myDatabase";
const dbUrl = "mongodb+srv://azam-project1:azam0315@back-end-development.qy3ydsz.mongodb.net/?retryWrites=true&w=majority&appName=Back-End-Development"

const connectMongo = async () => {
    try {
        const isconected = await mongoose.connect(
            dbUrl,
            { dbName: dbName },
        )
        isconected && console.log(`mongo db conected sucessfully`);
    }

    catch (error) {
        console.log(`something went wrong in mongo db database ${error}`)
    }

}

module.exports = connectMongo;