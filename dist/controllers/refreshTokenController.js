"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtConfig_1 = require("../config/jwtConfig");
const refreshToken = (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(401).json({ message: "Refresh token required" });
        return;
    }
    jsonwebtoken_1.default.verify(refreshToken, jwtConfig_1.REFRESH_TOKEN_SECRET, (err, decodedPayload) => {
        if (err) {
            res.status(403).json({ message: "Invalid refresh token" });
            return;
        }
        if (!decodedPayload ||
            typeof decodedPayload !== "object" ||
            !("userId" in decodedPayload)) {
            res.status(403).json({ message: "Invalid token payload" });
            return;
        }
        const decodedUser = decodedPayload;
        const accessToken = jsonwebtoken_1.default.sign({ userId: decodedUser.userId }, jwtConfig_1.JWT_SECRET, { expiresIn: jwtConfig_1.JWT_EXPIRES_IN || "15m" });
        res.status(200).json({ accessToken });
    });
};
exports.refreshToken = refreshToken;
