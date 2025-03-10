"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtConfig_1 = require("../config/jwtConfig");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Access token required" });
        return;
    }
    jsonwebtoken_1.default.verify(token, jwtConfig_1.JWT_SECRET, (err, decodedPayload) => {
        if (err) {
            res.status(403).json({ message: "Invalid or expired token" });
            return;
        }
        if (!decodedPayload ||
            typeof decodedPayload !== "object" ||
            !("userId" in decodedPayload)) {
            res.status(403).json({ message: "Invalid token payload" });
            return;
        }
        req.user = decodedPayload;
        next();
    });
};
exports.authenticateToken = authenticateToken;
