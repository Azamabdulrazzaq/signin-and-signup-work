// Note Importing Required Libraries..!
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const connectMongo = require("./src/Database/db");
const UserModal = require("./src/Modals/userModal/user-modal");
const nodemailer = require("nodemailer");
const credentials = require("./src/Credentials/credentials");
const { default: mongoose } = require("mongoose");


// Static Variable...!
const app = express();
const port = 5000;


// Note express MiddleWares!
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Note Mongodb connected here !
connectMongo();

//Note this is route to Sign up user functionality in DB! 
app.post(
    "/user/signup",
    async (req, res) => {
        const {
            userName,
            userEmail,
            userPassword,
            userNum,
        } = req.body;
        try {
            //400!
            if (!userName || !userEmail || !userPassword || !userNum) {
                return res.status(400).send({
                    status: false,
                    messege: "All Feils Are Required!"
                })
            }

            //402!
            const isUserExist = await UserModal.findOne({ email: userEmail });

            if (isUserExist) {
                return res.status(402).send({
                    status: false,
                    messege: "Email is already Exist!"
                })
            }

            // 200 user registered successfully!

            const encodePassword = btoa(userPassword);

            const newUserSave = {
                userName,
                email: userEmail,
                password: encodePassword,
                contactNum: userNum
            }
            const newUserAdd = new UserModal(newUserSave);

            const userSave = await newUserAdd.save();
            console.log(`NewUserSave ${userSave}`);

            if (userSave) {
                return res.status(200).send({
                    status: true,
                    messege: "User Registered Sucessfully!",
                    data: newUserAdd,
                })
            }

        }

        catch (error) {
            //500!
            console.log(`Something went wrong while fetch data from DB: ${error}`)
            return res.status(500).send({
                status: false,
                messege: "Something went wrong while fetch data from DB!"
            })
        }
    }
)

//Note this is route to Log in user functionality in DB!
app.post(
    "/user/Login",
    async (req, res) => {
        const { Email, Password } = req.body;

        try {
            //400!
            if (!Email || !Password) {
                return res.status(400).send({
                    status: false,
                    messege: "Email and Password Required!"
                })
            }
            //401!
            const isEmailExist = await UserModal.findOne({ email: Email });
            // console.log(`is Email Exist ${isEmailExist}`)

            if (!isEmailExist) {
                return res.status(401).send({
                    status: false,
                    messege: "Email is already Exist"
                })
            }


            //402!

            const userPassword = isEmailExist.password
            const decodePassword = atob(userPassword);

            if (Password != decodePassword) {
                return res.status(402).send({
                    status: false,
                    messege: "Invalid Pasword"
                })
            }
            //200!s
            return res.status(200).send({
                status: true,
                messege: "User Logged in Successfully!",
                data: isEmailExist
            })

        }

        catch (error) {
            //500!
            console.log(`Something Went Wrong While Login Email from DB: ${error}`);
            return res.status(500).send({
                status: false,
                messege: "Something Went Wrong While Login Email from DB!"
            })
        }
    }
)

const sendEmailToUser = (email, url, uid) => {
    console.log(`Sent Email ${email}`);

    const isMailSent = true;

    const encryptedUserId = btoa(uid);

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: credentials.email,
            pass: credentials.password
        }
    })

    const receiverDetails = {
        from: '"Azam shah 👻" <azams019@gmail.com>',
        to: email,
        Subject: "Email Verification",
        text: `Please Click the Link for forget Password! ${url}
        User Id : ${encryptedUserId} `
    }

    transporter.sendMail(
        receiverDetails,
        (err, emailInfo) => {
            if (!err) {
                console.log(`Email  sent to user Sucessfully`, emailInfo)
            }

            else {
                isMailSent = false
                console.log(`Something went wrong while forget password in DB ${err}`)
            }

        }

    )

    return isMailSent;

}

app.post(
    "/user/varification/DB",
    async (req, res) => {
        const { email } = req.body;
        // console.log(JSON.stringify(req.body))

        try {
            //400!
            if (!email) {
                return res.status(400).send({
                    status: false,
                    messege: "Email is Required!"
                })
            }

            //401
            const isUserExist = await UserModal.findOne({ email });
            console.log(`Is User Exist : ${isUserExist}`)

            if (!isUserExist) {
                return res.status(401).send({
                    status: false,
                    messege: "Email Does not Exist"
                })
            }
            //200!
            const redirectedUrl = "http://localhost:5000/user/forgetPassword/portal"
            const isEmailSent = sendEmailToUser(email, redirectedUrl, isUserExist._id);
            console.log(`is Email Sent : ${isEmailSent}`)

            return res.status(200).send({
                status: true,
                messege: "Email varification Sucessfully Kindly Check your Email"
            })
        }

        catch (error) {
            //500!
            console.log(`Something went wrong while update password: ${error}`);
            return res.status(500).send({
                status: false,
                messge: "Something went wrong while update password"
            })
        }
    }
)

// Note route to forget password from user!

app.get(
    "/user/forgetPassword/portal",
    (req, res) => {

        const redirectUrl = "https://hurt-beginner.surge.sh/";
        return res.redirect(redirectUrl);
    }
)

// Note route to password change in new password user!

app.put(
    "/user/update/forgetPassword",
    async (req, res) => {
        const { userId, newPassword } = req.body;
        console.log(`User Id: ${userId}`)
        console.log(`New Password: ${newPassword}`)

        try {
            //400!
            if (!userId || !newPassword) {
                return res.status(400).send({
                    status: false,
                    messege: "UserId and New Password Required"
                })
            }

            const decodeId = atob(userId);

            //401!
            const isValidId = new mongoose.isValidObjectId(decodeId);
            if (!isValidId) {
                return res.status.send({
                    status: false,
                    messege: "Invalid User Id"
                })
            }

            //200!
            const encodePassword = btoa(newPassword);

            const newUpdateUser = await UserModal.findByIdAndUpdate(
                decodeId,
                { password: encodePassword },
                { new: true }
            );
            if (newUpdateUser) {
                return res.status(200).send({
                    status: true,
                    messege: "New Password Updated Sucessfully",
                    data: newUpdateUser
                })
            }


        }

        catch (error) {
            //500!
            console.log(`Something went wrong while update Password from DB : ${error}`)
            return res.status(500).send({
                status: false,
                messege: "Something went wrong while update Password from DB"
            })

        }
    }
)




// app.get(
//     "/",
//     (req, res) => {
//         return res.status(200).send({
//             status: true,
//             messege: "wellcome to server node js!"
//         })
//     }
// )


app.listen(
    port,
    () => {
        console.log(`Server is running on http://localhost:${port}`);
    }
)