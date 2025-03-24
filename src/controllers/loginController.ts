import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "../models/UserModel";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtUtils";
import dotenv from "dotenv";
import logger from "../services/loggingService";

dotenv.config();

const PEPPER_SECRET = process.env.PEPPER_SECRET || "";


export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, pwd } = req.body;

    if (!email || !pwd) {
      logger.warn("Login failed due to missing credentials.", { email, ip: req.ip });
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      logger.warn("Login attempt failed. Email not found.", {
        attemptedEmail: email,
        ip: req.ip,
      });      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(pwd + PEPPER_SECRET, user.password);
    if (!isPasswordValid) {
      logger.warn("Login attempt failed. Incorrect password.", {
        email: user.email,
        userId: user.id,
        ip: req.ip,
      });      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    // ✅ Generate Access Token
    if (user.id === undefined) {
      throw new Error("User ID is undefined");
    }

    const accessToken = generateAccessToken(user.id, user.email);

    // ✅ Generate Refresh Token
    const refreshToken = generateRefreshToken(user.id);

    // ✅ Store Refresh Token in HTTP-only Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure only in production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    logger.info("Login successful.", {
      email: user.email,
      username: user.username,
      userId: user.id,
      ip: req.ip,
    });

    res.status(200).json({
      message: "Login successful!",
      accessToken,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Login error.", { error: error.message, stack: error.stack });
    } else {
      logger.error("Login error.", { error: String(error) });
    }    res.status(500).json({ message: "Internal server error" });
  }
};

export default loginUser;
