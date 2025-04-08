import { randomBytes } from "crypto";

export const generateVerificationToken = (): string => {
  const buffer = randomBytes(32);
  return buffer.toString("hex");
};
