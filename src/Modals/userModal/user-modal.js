
const mongoose = require("mongoose");

const UserSchemas = new mongoose.Schema(
    {
        userName: String,
        email: String,
        password: String,
        contactNum: String

    },
    {
        collection: "user-list"
    }
)

const userModal = mongoose.model("user-list", UserSchemas);

module.exports = userModal;