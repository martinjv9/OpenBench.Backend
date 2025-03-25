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
exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const validator_1 = __importDefault(require("validator"));
const UserModel_1 = require("../models/UserModel");
const dotenv_1 = __importDefault(require("dotenv"));
const loggingService_1 = __importDefault(require("../services/loggingService"));
dotenv_1.default.config();
const PEPPER_SECRET = process.env.PEPPER_SECRET || "";
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);
// Validate Input
// check email/username uniqueness
// hash, salt, pepper password
// store to DB
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Registering user");
        const { username, fName, lName, email, pwd, security_question_1, answer_1, security_question_2, answer_2, } = req.body;
        if (!username ||
            !fName ||
            !lName ||
            !email ||
            !pwd ||
            !security_question_1 ||
            !answer_1 ||
            !security_question_2 ||
            !answer_2) {
            loggingService_1.default.warn("Registration failed due to validation errors.", {
                username,
                email,
                ip: req.ip,
            });
            res.status(400).json({ message: "All fields required" });
            return;
        }
        if (!validator_1.default.isAlphanumeric(username) ||
            !validator_1.default.isLength(username, { min: 3, max: 50 })) {
            loggingService_1.default.warn("Registration failed due to username errors.", {
                username,
                email,
                ip: req.ip,
            });
            res.status(400).json({
                message: "Username must be alphanumeric and between 3-50 characters.",
            });
            return;
        }
        if (!validator_1.default.isEmail(email)) {
            loggingService_1.default.warn("Registration failed due to email error.", {
                username,
                email,
                ip: req.ip,
            });
            res.status(400).json({ message: "Invalid email format." });
            return;
        }
        const existingUser = yield (0, UserModel_1.findUserByEmail)(email);
        if (existingUser) {
            loggingService_1.default.warn("Registration failed due to already used email.", {
                username,
                email,
                ip: req.ip,
            });
            res.status(409).json({ message: "Email already in use." });
            return;
        }
        const existingUsername = yield (0, UserModel_1.findUserByUsername)(username);
        if (existingUsername) {
            loggingService_1.default.warn("Registration failed due to username in use.", {
                username,
                email,
                ip: req.ip,
            });
            res.status(409).json({ message: "Username already in use." });
            return;
        }
        const salt = yield bcryptjs_1.default.genSalt(SALT_ROUNDS);
        const hashedPassword = yield bcryptjs_1.default.hash(pwd + PEPPER_SECRET, salt);
        const hashedAnswer1 = yield bcryptjs_1.default.hash(answer_1 + PEPPER_SECRET, salt);
        const hashedAnswer2 = yield bcryptjs_1.default.hash(answer_2 + PEPPER_SECRET, salt);
        const newUser = {
            username,
            first_name: fName,
            last_name: lName,
            email,
            password: hashedPassword,
            security_question_1,
            answer_1: hashedAnswer1,
            security_question_2,
            answer_2: hashedAnswer2,
        };
        yield (0, UserModel_1.createUser)(newUser);
        loggingService_1.default.info("User registered successfully.", { username, email });
        res.status(201).json({ message: "User registered successfully!" });
    }
    catch (error) {
        if (error instanceof Error) {
            loggingService_1.default.error("Registration error.", {
                error: error.message,
                stack: error.stack,
            });
        }
        else {
            loggingService_1.default.error("Registration error.", {
                error: String(error),
            });
        }
        console.error("❌ Registration Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.registerUser = registerUser;
exports.default = exports.registerUser;
