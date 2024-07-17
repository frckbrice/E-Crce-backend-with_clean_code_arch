const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 465,
//     secure: true, // Use `true` for port 465, `false` for all other ports
//     auth: {
//         user: process.env.MY_EMAIL,
//         pass: process.env.PASSWORD,
//     },
// });

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.google.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.PASSWORD,
    },
});


// async..await is not allowed in global scope, must use a wrapper
module.exports = async function sendEmail({ userEmail, resetPasswordLink }) {

    console.log("hit the email sender")
    return await transporter.sendMail({
        from: '"maebrie-commerce" <maebrice@ethereal.email>',
        to: userEmail,
        subject: "FORGOT PASSWORD",
        text: `Hello! kindly click on the following email in order to reset your password ${resetPasswordLink}`, // plain text body

    }).then((emaildata) => {
        console.log("Email sent: ", emaildata);
    }).catch((error) => {
        console.error(error);
    });
}
