import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { findOneTimeCode, deleteOneTimeCode } from "../models/OneTimeCodeModel";
import logger from "../services/loggingService";

export const verifyOTC = async (req: Request, res: Response): Promise<void> => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    res.status(400).json({ message: "User ID and code are required" });
    return;
  }

  try {
    const oneTimeCode = await findOneTimeCode(userId);

    if (!oneTimeCode) {
      res.status(404).json({ message: "One-time code not found" });
      return;
    }

    if (new Date(oneTimeCode.expiresAt) < new Date()) {
      await deleteOneTimeCode(userId);
      res.status(400).json({ message: "One-time code has expired" });
      return;
    }

    const codeValid = await bcrypt.compare(code, oneTimeCode.codeHash);

    if (!codeValid) {
      res.status(400).json({ message: "Invalid one-time code" });
      return;
    }

    await deleteOneTimeCode(userId);

    logger.info("✅ One-time code verified successfully", { userId });
    res.status(200).json({ message: "One-time code verified successfully" });
  } catch (error) {
    logger.error("❌ Error in verifyOTC:", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    console.error("❌ Error in verifyOTC:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
