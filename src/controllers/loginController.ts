import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "../models/UserModel";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtUtils";

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, pwd } = req.body;

    if (!email || !pwd) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      console.warn(`❌ Login failed: User not found for email: ${email}`);
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(pwd, user.password);
    if (!isPasswordValid) {
      console.warn(`❌ Login failed: Invalid password for email: ${email}`);
      res.status(401).json({ message: "Invalid email or password." });
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
