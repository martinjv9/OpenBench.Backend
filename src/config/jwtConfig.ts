import dotenv from "dotenv";

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
export const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "supersecretrefreshkey";
export const REFRESH_TOKEN_EXPIRES_IN =
  process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
