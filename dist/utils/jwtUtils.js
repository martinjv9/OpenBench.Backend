"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtConfig_1 = require("../config/jwtConfig");
const jwtExpiresIn = jwtConfig_1.JWT_EXPIRES_IN || "15m";
const refreshTokenExpiresIn = jwtConfig_1.REFRESH_TOKEN_EXPIRES_IN || "7d";
if (!jwtConfig_1.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in the .env file");
}
if (!jwtConfig_1.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is missing in the .env file");
}
const generateAccessToken = (userId, email) => {
    return jsonwebtoken_1.default.sign({ userId, email }, jwtConfig_1.JWT_SECRET, { expiresIn: jwtExpiresIn });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, jwtConfig_1.REFRESH_TOKEN_SECRET, { expiresIn: refreshTokenExpiresIn });
};
exports.generateRefreshToken = generateRefreshToken;
