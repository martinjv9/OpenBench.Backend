import { Request, Response, NextFunction } from "express";
import logger from "../services/loggingService";

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;
    logger.info("User role:", userRole);

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({ message: "Access denied: insufficient rights" });
      return;
    }

    next();
  };
};
