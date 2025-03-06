import jwt, { Secret, SignOptions } from "jsonwebtoken";
import {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
} from "../config/jwtConfig";

const jwtExpiresIn: string = JWT_EXPIRES_IN || "15m";
const refreshTokenExpiresIn: string = REFRESH_TOKEN_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in the .env file");
}
if (!REFRESH_TOKEN_SECRET) {
  throw new Error("REFRESH_TOKEN_SECRET is missing in the .env file");
}

export const generateAccessToken = (userId: number, email: string): string => {
  return jwt.sign(
    { userId, email },
    JWT_SECRET as Secret,
    { expiresIn: jwtExpiresIn } as SignOptions
  );
};

export const generateRefreshToken = (userId: number): string => {
  return jwt.sign(
    { userId },
    REFRESH_TOKEN_SECRET as Secret,
    { expiresIn: refreshTokenExpiresIn } as SignOptions
  );
};
