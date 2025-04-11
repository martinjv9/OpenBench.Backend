import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  REFRESH_TOKEN_SECRET,
  JWT_SECRET,
  JWT_EXPIRES_IN,
} from "../config/jwtConfig";
import { generateAccessToken } from "../utils/jwtUtils";
import logger from "../services/loggingService";
import { findUserById } from "../models/UserModel";

// Define JWT payload type
interface DecodedUser extends JwtPayload {
  userId: number;
}

export const refreshToken = (req: Request, res: Response): void => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token required" });
    return;
  }

  jwt.verify(
    refreshToken,
    REFRESH_TOKEN_SECRET,
    (
      err: jwt.VerifyErrors | null,
      decodedPayload: string | JwtPayload | undefined
    ) => {
      if (err) {
        res.status(403).json({ message: "Invalid refresh token" });
        return;
      }

      if (
        !decodedPayload ||
        typeof decodedPayload !== "object" ||
        !("userId" in decodedPayload)
      ) {
        res.status(403).json({ message: "Invalid token payload" });
        return;
      }

      const decodedUser = decodedPayload as DecodedUser;

      const accessToken = jwt.sign(
        { userId: decodedUser.userId },
        JWT_SECRET as string,
        { expiresIn: JWT_EXPIRES_IN || "15m" } as jwt.SignOptions
      );

      res.status(200).json({ accessToken });
    }
  );
};

export const refreshAccessToken = (req: Request, res: Response): void => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token required" });
    return;
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { userId: number; email: string; role: string };

    const userInfo = findUserById(decoded.userId);
    if (!userInfo) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const accessToken = generateAccessToken(
      decoded.userId,
      decoded.email,
      decoded.role
    );

    logger.info("✅ Access token refreshed.", { userId: decoded.userId });

    res.status(200).json({ accessToken });
  } catch (error) {
    logger.error("❌ Invalid refresh token", { error });
    res.status(403).json({ message: "Invalid refresh token" });
  }
};
