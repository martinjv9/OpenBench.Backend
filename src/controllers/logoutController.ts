import { Request, Response } from "express";
import logger from "../services/loggingService";

export const logoutUser = (req: Request, res: Response): void => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });
  logger.info("✅ User logged out successfully");

  res.status(200).json({ message: "User logged out successfully" });
};
