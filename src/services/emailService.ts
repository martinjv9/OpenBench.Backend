import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmailVerification = async (
  to: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
  const html = `<p>Please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Email Verification",
    html,
  });
};

export const sendOTCEmail = async (to: string, code: string): Promise<void> => {
  const html = `<p>Your one-time code is: <strong>${code}</strong></p><p>This code expires in 5 minutes.</p>`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Your One-Time Code",
    html,
  });
};
