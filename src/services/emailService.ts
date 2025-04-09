import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import dotenv from "dotenv";
import pool from "../config/db";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
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
  const html = compileTemplate("emailVerification", { verificationUrl });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: "Email Verification",
      html,
    });

    // Log email sent to database
    const query =
      "INSERT INTO email_logs (to_email, subject, status) VALUES (?, ?, ?)";
    const params = [to, "Email Verification", "SUCCESS"];
    await pool.execute(query, params);
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

export const sendOTCEmail = async (to: string, code: string): Promise<void> => {
  try {
    const html = compileTemplate("oneTimeCode", { code });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: "Your One-Time Code",
      html,
    });

    // Log email sent to database
    const query =
      "INSERT INTO email_logs (to_email, subject, status) VALUES (?, ?, ?)";
    const params = [to, "One-Time Code", "SUCCESS"];
    await pool.execute(query, params);
  } catch (error) {
    console.error("Error sending OTC email:", error);
    throw new Error("Failed to send one-time code email");
  }
};

// Helper function to compile templates
const compileTemplate = (templateName: string, data: any): string => {
  const filePath = path.join(__dirname, "../templates", `${templateName}.hbs`);
  const source = fs.readFileSync(filePath, "utf8");
  const template = handlebars.compile(source);
  return template(data);
};
