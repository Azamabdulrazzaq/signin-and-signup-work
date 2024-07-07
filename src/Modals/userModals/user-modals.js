// Note for Save data in data base user schemas...!
const mongoose = require("mongoose");
const userSchemas = new mongoose.Schema(
    {
        userName: String,
        contactNum: String,
        email: String,
        password: String,
        createdAt: {
            type: Date,
            default: Date.now()
        }
    },
    {
        collection: "users"
    }
);

// user Modal for dataBase in mongoDB...!

const UserModal = mongoose.model("users", userSchemas);

module.exports = UserModal;