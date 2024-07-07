const nodemailer = require("nodemailer");

const sentMail = async (req, res) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
            user: 'pascale21@ethereal.email',
            pass: 'dezQbr6CtRn5Sxfbpk'
        },
    })

    const info = await transporter.sendMail({
        from: '"Azam shah 👻" <pascale21@ethereal.email>', // sender address
        to: "azams019@gmail,com", // list of receivers
        subject: "Hello Azam", // Subject line
        text: "How Are You", // plain text body
        html: "<b>Hello world</b>",
    })
    console.log("Message sent: %s", info.messageId);

    res.send("I am a azam");
}

module.exports = sentMail;