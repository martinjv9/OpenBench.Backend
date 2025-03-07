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
