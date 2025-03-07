import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwtConfig";

// ✅ Define custom `DecodedUser` type
interface DecodedUser extends JwtPayload {
  userId: number;
  email?: string;
}

// ✅ Extend Express Request Type to Support `req.user`
declare module "express-serve-static-core" {
  interface Request {
    user?: DecodedUser;
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Access token required" });
    return;
  }

  jwt.verify(
    token,
    JWT_SECRET as string,
    (
      err: VerifyErrors | null,
      decodedPayload: string | JwtPayload | undefined
    ) => {
      if (err) {
        res.status(403).json({ message: "Invalid or expired token" });
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

      req.user = decodedPayload as DecodedUser;
      next();
    }
  );
};
