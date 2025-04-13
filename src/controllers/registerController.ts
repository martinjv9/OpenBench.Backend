import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import validator from "validator";
import {
  createUser,
  User,
  findUserByEmail,
  findUserByUsername,
} from "../models/UserModel";
import dotenv from "dotenv";
import logger from "../services/loggingService";
import { generateVerificationToken } from "../utils/generateToken";
import { createOneTimeCode } from "../models/OneTimeCodeModel";
import { sendEmailVerification, sendOTCEmail } from "../services/emailService";
import { createVerificationToken } from "../models/VerificationTokenModel";

dotenv.config();

const PEPPER_SECRET = process.env.PEPPER_SECRET || "";
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);

/*
*   Creates a new user and adds it to the database
*   
*   @param json files {
      "username": "abc123",
      "fName": "First",
      "lName": "Last",
      "email": "newuser123@example.com",
      "pwd": "Password01",
      "security_question_1": "What is your mother's maiden name?",
      "answer_1": "Smith",
      "security_question_2": "What was the name of your first pet?",
      "answer_2": "Fido"
    }

*   @ res.status(201).json({ message: "User registered successfully!" })
*/
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Registering user");
    const {
      username,
      fName,
      lName,
      email,
      pwd,
      security_question_1,
      answer_1,
      security_question_2,
      answer_2,
    } = req.body;

    if (
      !username ||
      !fName ||
      !lName ||
      !email ||
      !pwd ||
      !security_question_1 ||
      !answer_1 ||
      !security_question_2 ||
      !answer_2
    ) {
      logger.warn("Registration failed due to validation errors.", {
        username,
        email,
        ip: req.ip,
      });
      res.status(400).json({ message: "All fields required" });
      return;
    }

    if (
      !validator.isAlphanumeric(username) ||
      !validator.isLength(username, { min: 3, max: 50 })
    ) {
      logger.warn("Registration failed due to username errors.", {
        username,
        email,
        ip: req.ip,
      });
      res.status(400).json({
        message: "Username must be alphanumeric and between 3-50 characters.",
      });
      return;
    }

    if (!validator.isEmail(email)) {
      logger.warn("Registration failed due to email error.", {
        username,
        email,
        ip: req.ip,
      });
      res.status(400).json({ message: "Invalid email format." });
      return;
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      logger.warn("Registration failed due to already used email.", {
        username,
        email,
        ip: req.ip,
      });
      res.status(409).json({ message: "Email already in use." });
      return;
    }

    const existingUsername = await findUserByUsername(username);
    if (existingUsername) {
      logger.warn("Registration failed due to username in use.", {
        username,
        email,
        ip: req.ip,
      });
      res.status(409).json({ message: "Username already in use." });
      return;
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS);

    const hashedPassword = await bcrypt.hash(pwd + PEPPER_SECRET, salt);
    const hashedAnswer1 = await bcrypt.hash(answer_1 + PEPPER_SECRET, salt);
    const hashedAnswer2 = await bcrypt.hash(answer_2 + PEPPER_SECRET, salt);

    const newUser: User = {
      username,
      first_name: fName,
      last_name: lName,
      email,
      password: hashedPassword,
      security_question_1,
      answer_1: hashedAnswer1,
      security_question_2,
      answer_2: hashedAnswer2,
      role: "user",
    };

    const userId = await createUser(newUser);

    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await createVerificationToken({
      user_id: userId,
      token: verificationToken,
      expiresAt,
    });

    await sendEmailVerification(email, verificationToken);

    logger.info("User registered successfully.", { username, email });
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Registration error.", {
        error: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("Registration error.", {
        error: String(error),
      });
    }
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendOTC = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      res.status(400).json({ message: "User ID and email are required" });
      return;
    }

    const code = await createOneTimeCode(userId);

    await sendOTCEmail(email, code);

    logger.info("One-time code sent to email.", { email });
    res.status(200).json({ message: "One-time code sent to email." });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("OTC sending error.", {
        error: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("OTC sending error.", {
        error: String(error),
      });
    }
    console.error("❌ OTC Sending Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default registerUser;
