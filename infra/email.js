import nodemailer from "nodemailer";
import { ServiceError } from "./errors.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  secure: process.env.NODE_ENV === "production" ? true : false,
});

async function sendEmail(mailOptions) {
  try {
    await transporter.sendMail(mailOptions);
  }catch(error){
    throw new ServiceError({
      message: "Can not send email.",
      action: "Verify Mail Server.",
      cause: "error",
      context: mailOptions
    })
  }
}

const email = {
  sendEmail,
};

export default email;
