var nodemailer = require("nodemailer");

//export that module//
module.exports = {
    mailSend: mailSend
}
/*
    Here we are configuring our SMTP Server details.
    STMP is mail server which is responsible for sending and recieving email.
*/

var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "niteshnigam10@gmail.com",
        pass: "lkazzkntvsltzxnb"
    }
});
var rand, mailOptions, host, link;
/*------------------SMTP Over-----------------------------*/

/*------------------Routing Started ------------------------*/

function mailSend(data) {

    mailOptions = {
        from: 'niteshnigam10@gmail.com',
        to: data.email,
        subject: "Please confirm your Email account",
        html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + data.url + data.token + ">Click here to verify</a>"
    }
    console.log(mailOptions);

    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log(error);
        }
        else {
            console.log("Message sent: " + JSON.stringify(response));
        }
    })
}
