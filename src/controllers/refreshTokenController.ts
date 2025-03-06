import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  REFRESH_TOKEN_SECRET,
  JWT_SECRET,
  JWT_EXPIRES_IN,
} from "../config/jwtConfig";

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
    (err: jwt.VerifyErrors | null, user: DecodedUser | undefined) => {
      if (err) {
        res.status(403).json({ message: "Invalid refresh token" });
        return;
      }

      if (!user || !user.userId) {
        res.status(403).json({ message: "Invalid token payload" });
        return;
      }

      // ✅ Generate new access token
      const accessToken = jwt.sign({ userId: user.userId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      res.status(200).json({ accessToken });
    }
  );
};
