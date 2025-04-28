import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import {
  deleteOneTimeCode,
  findOneTimeCodebyUserId,
} from "../models/OneTimeCodeModel";
import logger from "../services/loggingService";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtUtils";
import { findUserById } from "../models/UserModel";

export const verifyOTC = async (req: Request, res: Response): Promise<void> => {
  const { userId, code } = req.body;
  console.log("Received userId and code:", userId, code); // Debugging line to check input values

  if (!userId || !code) {
    res.status(400).json({ message: "User ID and code are required" });
    return;
  }

  try {
    console.log("Taco 1");
    const oneTimeCode = await findOneTimeCodebyUserId(userId);
    const user = await findUserById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!oneTimeCode) {
      console.log("Taco 2", oneTimeCode, user); // Debugging line to check retrieved data

      res.status(404).json({ message: "One-time code not found" });
      return;
    }

    console.log("Taco 3", oneTimeCode); // Debugging line to check one-time code
    if (new Date(oneTimeCode.expiresAt) < new Date()) {
      await deleteOneTimeCode(userId);
      res.status(400).json({ message: "One-time code has expired" });
      return;
    }
    const codeValid = await bcrypt.compare(code, oneTimeCode.codeHash);

    console.log("Taco 4", codeValid); // Debugging line to check code validity
    if (!codeValid) {
      res.status(400).json({ message: "Invalid one-time code" });
      return;
    }
    console.log("Taco 5"); // Debugging line to check code flow
    await deleteOneTimeCode(userId);

    const accessToken = generateAccessToken(userId, user.email, user.role);
    // ✅ Generate Refresh Token
    const refreshToken = generateRefreshToken(userId, user.email, user.role);
    console.log("Taco 6"); // Debugging line to check code flow
    // ✅ Store Refresh Token in HTTP-only Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure only in production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    console.log("Taco 7"); // Debugging line to check code flow
    logger.info("Login successful.", {
      email: user.email,
      username: user.username,
      userId: user.id,
      ip: req.ip,
    });

    logger.info("✅ One-time code verified successfully", { userId });
    res.status(200).json({
      message: "One-time code verified successfully",
      accessToken,
      role: user.role
    });

  } catch (error) {
    logger.error("❌ Error in verifyOTC:", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    console.error("❌ Error in verifyOTC:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
