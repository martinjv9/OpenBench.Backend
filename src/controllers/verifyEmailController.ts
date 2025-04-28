import { Request, Response } from "express";
import {
  findVerificationToken,
  deleteVerificationToken,
} from "../models/VerificationTokenModel";
import logger from "../services/loggingService";
import pool from "../config/db";

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.query;
    logger.info("🔑 Verifying token:", { token });
    if (!token || typeof token !== "string") {
      res.status(400).json({ message: "Invalid verification token" });
      return;
    }
    const verificationToken = await findVerificationToken(token);
    if (!verificationToken) {
      res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
      return;
    }
    if (new Date(verificationToken.expiresAt) < new Date()) {
      await deleteVerificationToken(token);
      res.status(400).json({ message: "Verification token has expired" });
      return;
    }

    const userId = verificationToken.user_id;
    // Update user's verified status in the database
    const updateQuery = `
            UPDATE users 
            SET is_verified = 1 
            WHERE id = ?
        `;
    const [result]: any = await pool.execute(updateQuery, [userId]);
    if (result.affectedRows === 0) {
      res.status(500).json({ message: "Failed to verify email" });
      return;
    }

    // Delete the verification token after successful verification
    await deleteVerificationToken(token);
    logger.info("✅ Email verified successfully", { userId });
    res.redirect(`${process.env.FRONTEND_URL}/verify?status=success`);
  } catch (error) {
    logger.error("❌ Error in verifyEmail:", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.redirect(`${process.env.FRONTEND_URL}/verify?status=error`);
  }
};
