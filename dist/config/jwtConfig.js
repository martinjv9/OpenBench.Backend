"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_TOKEN_EXPIRES_IN = exports.REFRESH_TOKEN_SECRET = exports.JWT_EXPIRES_IN = exports.JWT_SECRET = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const checkEnvVar = (key) => {
    var _a;
    const value = (_a = process.env[key]) === null || _a === void 0 ? void 0 : _a.trim(); // ✅ Trim whitespace just in case
    if (!value) {
        throw new Error(`❌ Missing environment variable: ${key}`);
    }
    return value;
};
// Securely load JWT secrets
exports.JWT_SECRET = checkEnvVar("JWT_SECRET");
exports.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m"; // Default 15m
exports.REFRESH_TOKEN_SECRET = checkEnvVar("REFRESH_TOKEN_SECRET");
exports.REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"; // Default 7d
