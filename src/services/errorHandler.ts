import { Response } from "express";
import logger from "../services/loggingService";

export const handleError = (
  res: Response,
  error: any,
  customMessage = "Internal server error"
) => {
  logger.error(customMessage, { error });
  return res.status(500).json({ message: customMessage });
};
