import nodemailer from "nodemailer";
export const smtpTransport = nodemailer.createTransport({
  host: "smtp-relay.sendinblue.com",
  port: 587,
  auth: {
    user: "quasarkid339203@gmail.com",
    pass: "EFx1zKJC4shTH5cr",
  },
});
