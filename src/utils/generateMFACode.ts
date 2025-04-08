import crypto from "crypto";

export const generateMFACode = (): string => {
  const buffer = crypto.randomBytes(4);
  const number = buffer.readUInt32BE(0) % 1000000;
  return number.toString().padStart(8, "0");
};
