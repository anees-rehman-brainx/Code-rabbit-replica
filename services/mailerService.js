const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_SERVICE,
  port: parseInt(process.env.MAIL_PORT),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendMail = (to, subject, html) => {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to,
      subject,
      html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("error", error)
        reject(error);
      } else {
        console.log(info.response)
        resolve(info.response);
      }
    });
  });
};

module.exports = {
  sendMail,
};
