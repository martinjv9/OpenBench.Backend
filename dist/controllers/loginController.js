"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserModel_1 = require("../models/UserModel");
const jwtUtils_1 = require("../utils/jwtUtils");
const dotenv_1 = __importDefault(require("dotenv"));
const loggingService_1 = __importDefault(require("../services/loggingService"));
dotenv_1.default.config();
const PEPPER_SECRET = process.env.PEPPER_SECRET || "";
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, pwd } = req.body;
        if (!email || !pwd) {
            loggingService_1.default.warn("Login failed due to missing credentials.", { email, ip: req.ip });
            res.status(400).json({ message: "Email and password are required." });
            return;
        }
        const user = yield (0, UserModel_1.findUserByEmail)(email);
        if (!user) {
            loggingService_1.default.warn("Login attempt failed. Email not found.", {
                attemptedEmail: email,
                ip: req.ip,
            });
            res.status(401).json({ message: "Invalid email or password." });
            return;
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(pwd + PEPPER_SECRET, user.password);
        if (!isPasswordValid) {
            loggingService_1.default.warn("Login attempt failed. Incorrect password.", {
                email: user.email,
                userId: user.id,
                ip: req.ip,
            });
            res.status(401).json({ message: "Invalid email or password." });
            return;
        }
        // ✅ Generate Access Token
        if (user.id === undefined) {
            throw new Error("User ID is undefined");
        }
        const accessToken = (0, jwtUtils_1.generateAccessToken)(user.id, user.email);
        // ✅ Generate Refresh Token
        const refreshToken = (0, jwtUtils_1.generateRefreshToken)(user.id);
        // ✅ Store Refresh Token in HTTP-only Cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Secure only in production
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        loggingService_1.default.info("Login successful.", {
            email: user.email,
            username: user.username,
            userId: user.id,
            ip: req.ip,
        });
        res.status(200).json({
            message: "Login successful!",
            accessToken,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            loggingService_1.default.error("Login error.", { error: error.message, stack: error.stack });
        }
        else {
            loggingService_1.default.error("Login error.", { error: String(error) });
        }
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.loginUser = loginUser;
exports.default = exports.loginUser;
