import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  REFRESH_TOKEN_SECRET,
  JWT_SECRET,
  JWT_EXPIRES_IN,
} from "../config/jwtConfig";

export const refreshToken = (req: Request, res: Response): void => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token required" });
    return;
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ message: "Invalid refresh token" });
      return;
    }

    const accessToken = jwt.sign({ userId: user.userId }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(200).json({ accessToken });
  });
};
