import { Request, Response } from "express";
import { findUserById } from "../models/UserModel";
import { createOneTimeCode } from "../models/OneTimeCodeModel";
import { sendOTCEmail } from "../services/emailService";
import logger from "../services/loggingService";

export const resendOTC = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ message: "User ID is required" });
    return;
  }

  try {
    const user = await findUserById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const code = await createOneTimeCode(user.id as number);
    await sendOTCEmail(user.email, code);

    logger.info("✅ One-time code resent to user", { userId });

    res.status(200).json({
      message: "One-time code resent to your email.",
      step: "verify-otc",
      userId: user.id,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("❌ Error in resendOTC:", {
        userId,
        error: error.message,
      });
      res.status(500).json({ message: "Failed to resend one-time code." });
    } else {
      logger.error("❌ Unknown error in resendOTC:", { userId, error });
      res.status(500).json({ message: "Failed to resend one-time code." });
    }
  }
};
