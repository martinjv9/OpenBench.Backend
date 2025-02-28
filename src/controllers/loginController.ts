import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail } from "../models/UserModel";
import {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
} from "../config/jwtConfig";

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, pwd } = req.body;

    if (!email || !pwd) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(pwd, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    // ✅ Generate Access Token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // ✅ Generate Refresh Token
    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    // ✅ Store Refresh Token in HTTP-only Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: "strict",
    });

    res.status(200).json({
      message: "Login successful!",
      accessToken,
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default loginUser;
