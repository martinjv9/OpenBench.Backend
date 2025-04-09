import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "../models/UserModel";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtUtils";
import dotenv from "dotenv";
import logger from "../services/loggingService";
import { createOneTimeCode } from "../models/OneTimeCodeModel";
import { sendOTCEmail } from "../services/emailService";

dotenv.config();

const PEPPER_SECRET = process.env.PEPPER_SECRET || "";

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, pwd } = req.body;

    if (!email || !pwd) {
      logger.warn("Login failed due to missing credentials.", {
        email,
        ip: req.ip,
      });
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      logger.warn("Login attempt failed. Email not found.", {
        attemptedEmail: email,
        ip: req.ip,
      });
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      pwd + PEPPER_SECRET,
      user.password
    );
    if (!isPasswordValid) {
      logger.warn("Login attempt failed. Incorrect password.", {
        email: user.email,
        userId: user.id,
        ip: req.ip,
      });
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const code = await createOneTimeCode(user.id as number);
    await sendOTCEmail(user.email, code);

    res.status(200).json({
      message: "One-time code sent to your email.",
      step: "verify-otc",
      userId: user.id,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Login error.", {
        error: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("Login error.", { error: String(error) });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export default loginUser;
