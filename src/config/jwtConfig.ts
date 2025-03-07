import dotenv from "dotenv";

dotenv.config();

const checkEnvVar = (key: string): string => {
  const value = process.env[key]?.trim(); // ✅ Trim whitespace just in case
  if (!value) {
    throw new Error(`❌ Missing environment variable: ${key}`);
  }
  return value;
};

// Securely load JWT secrets
export const JWT_SECRET = checkEnvVar("JWT_SECRET");
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m"; // Default 15m
export const REFRESH_TOKEN_SECRET = checkEnvVar("REFRESH_TOKEN_SECRET");
export const REFRESH_TOKEN_EXPIRES_IN =
  process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"; // Default 7d
