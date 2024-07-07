const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const connectMongo = require("./src/Database/db");
const UserModal = require("./src/Modals/userModals/user-modals");
const nodemailer = require("nodemailer");
const credentials = require("./src/Credentials/credentials");
const sentMail = require("./src/Controller/sentMail");
const { default: mongoose } = require("mongoose");


// Static Variables!
const app = express();
const port = 8080;

// Express MiddleWares!
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

//Note MongoDb connected here!
connectMongo();

// Note this functionality for sign up user from data base method Post!


app.post(
    "/user/register",
    async (req, res) => {
        const {
            userName,
            userNum,
            userEmail,
            userPassword
        } = req.body;
        // console.log(`All data ${JSON.stringify(req.body)}`)
        try {
            //400!
            if (!userName || !userNum || !userEmail || !userPassword) {
                return res.status(400).send({
                    status: false,
                    message: "All fields are required"
                })

            }

            //404! Exist or not exist!

            const isUserExist = await UserModal.findOne({ email: userEmail })

            if (isUserExist) {
                return res.status(404).send({
                    status: false,
                    message: "Email is already exist"
                })
            }

            //200 user Registered Sucessfully!

            const encodePassword = btoa(userPassword);

            const userToSave = {
                userName,
                contactNum: userNum,
                email: userEmail,
                password: encodePassword,
            };

            const newUserAdd = new UserModal(userToSave);

            const userSave = await newUserAdd.save();
            console.log(`User Adeded ${userSave}`)

            if (userSave) {
                return res.status(200).send({
                    status: true,
                    message: "User Registered Sucessfully",
                    data: newUserAdd
                });
            }


        }

        catch (error) {
            console.log(`Something went wrong while fetching data from db: ${error} `);
            //500!
            return res.status(500).send({
                status: false,
                message: "Something went wrong while fetching data from db:"
            });
        }
    }
);

// Note this functionality for sign in user from data base method post!

app.post(
    "/user/Login",
    async (req, res) => {
        const { email, password } = req.body;
        try {
            //400!
            if (!email || !password) {
                return res.status(400).send({
                    status: false,
                    message: "Email and Password Required!"
                })
            }

            //401!
            const isUserExist = await UserModal.findOne({ email });
            // console.log(`user exist ${isUserExist}`);
            if (!isUserExist) {
                return res.status(401).send({
                    status: false,
                    message: "Email does not Exist"
                })
            }

            // 402!
            const userPassword = isUserExist.password;
            const decodePassword = atob(userPassword);
            // console.log(`decodePassword ${decodePassword}`);
            if (password != decodePassword) {
                return res.status(402).send({
                    status: false,
                    message: "invalid Password"
                })
            }

            //200!
            return res.status(200).send({
                status: true,
                message: "You have logged in Successfully!",
                data: isUserExist
            })
        }

        catch (error) {
            //500!
            console.log(`Something Went wrong while fetching data fro db :  ${error}`);
            return res.status(500).send({
                status: false,
                message: "Something Went wrong while fetching data fro db"
            })
        }
    }
);

const sendEmailToUser = (email, url, uid) => {
    console.log(`email sent ${email}`)

    let isMailSent = true

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
        subject: "Email Varification",
        text: `please click the Link for your forget password : ${url}
        User Id ${encryptedUserId}`
    };

    transporter.sendMail(
        receiverDetails,
        (err, emailInfo) => {
            if (!err) {
                console.log(`Email sent successfully :`, emailInfo)
            }

            else {
                isMailSent = false
                console.log(`Somthing went wrong while send email to user ${err}`)
            }
        }
    )
    return isMailSent;
}

// Note Api Route to verify Users!
app.post(
    "/user/verify",
    async (req, res) => {
        const { email } = req.body;
        try {
            //400!
            if (!email) {
                return res.status(400).send({
                    status: false,
                    message: "Email is Required"
                });
            }
            //401!
            const isUserExist = await UserModal.findOne({ email });
            // console.log(`user Email ${isUserExist}`)
            if (!isUserExist) {
                return res.status(401).send({
                    status: false,
                    message: "Email does not Exist"
                })
            }
            //200!
            const redirectedUrl = `http://localhost:8080/user/forgetPassword/portal/`
            const isEmailSent = sendEmailToUser(email, redirectedUrl, isUserExist._id);
            console.log(`Email Sent : ${isEmailSent}`)

            if (isEmailSent) {
                return res.status(200).send({
                    status: true,
                    message: "Email verified successfully check your Email!"
                })
            }
        }

        catch (error) {
            //500!
            console.log(`Something went wrong while verifying Data from db: ${error}`)
            return res.status(500).send({
                status: false,
                message: "Something went wrong while verifying Data from db"
            })
        }
    }
)

// Note go to route / forget Password from user..!

app.get(
    "/user/forgetPassword/portal",
    (req, res) => {
        // const { id } = req.params;
        // console.log(`Uid : ${id}`)

        const webRedirectUrl = "https://laughable-comb.surge.sh/"
        return res.redirect(webRedirectUrl);
    }
)

// Note Api  route to go  Update Password!..

app.put(
    "/user/update/password",
    async (req, res) => {
        const { userId, newPassword } = req.body;
        console.log(`user Id : ${userId}`)
        console.log(`update password:  ${newPassword}`)

        try {
            //400!
            if (!userId || !newPassword) {
                return res.status(400).send({
                    status: false,
                    message: "UserId And New password Requried"
                })
            }

            const decodeID = atob(userId);

            //401!
            const isValidId = mongoose.isValidObjectId(decodeID);

            if (!isValidId) {
                return res.status(401).send({
                    status: false,
                    message: "Invalid User Id"
                })

            }

            //200!

            const encodedPassword = btoa(newPassword)
            const updateUser = await UserModal.findByIdAndUpdate(
                decodeID,
                { password: encodedPassword },
                { new: true }
            )

            if (updateUser) {
                return res.status(200).send({
                    status: true,
                    message: "User id And New Password updated",
                    data: updateUser
                })
            }

        }

        catch (error) {
            //500!
            console.log(`Something went wrong while updating password : ${error}`)
            return res.status(500).send({
                status: false,
                message: "Something went wrong while updating password"
            })
        }
    }
)



// app.get("/Sendmail", sentMail);




// Note Server Run...!
app.listen(
    port,
    () => {
        console.log(`Server is running on http://localhost:${port}`);
    }
);