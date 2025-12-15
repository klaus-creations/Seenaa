import "dotenv/config"

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendingEmailInputs {
    to: string,
    subject: string,
    html: string,
    text: string
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendingEmailInputs) {
  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html,
    text,
  });
}

