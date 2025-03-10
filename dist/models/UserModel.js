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
exports.findUserByUsername = exports.findUserByEmail = exports.createUser = void 0;
const db_1 = __importDefault(require("../config/db"));
// Create a new user in MySQL
const createUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.query("INSERT INTO users (username, first_name, last_name, email, password, security_question_1, answer_1, security_question_2, answer_2) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
        user.username,
        user.first_name,
        user.last_name,
        user.email,
        user.password,
        user.security_question_1,
        user.answer_1,
        user.security_question_2,
        user.answer_2,
    ]);
});
exports.createUser = createUser;
// Find user by email
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_1.default.query("SELECT * FROM users WHERE email = ?", [email]);
        if (!rows || rows.length === 0) {
            return null;
        }
        return rows[0];
    }
    catch (error) {
        console.error("❌ Database Error in findUserByEmail:", error);
        throw new Error("Database query failed");
    }
});
exports.findUserByEmail = findUserByEmail;
// Find user by username
const findUserByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_1.default.query("SELECT * FROM users WHERE username = ?", [username]);
        if (!rows || rows.length === 0) {
            return null;
        }
        return rows[0];
    }
    catch (error) {
        console.error("❌ Database Error in findUserByUsername:", error);
        throw new Error("Database query failed");
    }
});
exports.findUserByUsername = findUserByUsername;
