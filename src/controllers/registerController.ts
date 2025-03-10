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

dotenv.config();

const PEPPER_SECRET = process.env.PEPPER_SECRET || "";
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);

// Validate Input
// check email/username uniqueness
// hash, salt, pepper password
// store to DB

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
      res.status(400).json({ message: "All fields required" });
      return;
    }

    if (
      !validator.isAlphanumeric(username) ||
      !validator.isLength(username, { min: 3, max: 50 })
    ) {
      res.status(400).json({
        message: "Username must be alphanumeric and between 3-50 characters.",
      });
      return;
    }

    if (!validator.isEmail(email)) {
      res.status(400).json({ message: "Invalid email format." });
      return;
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ message: "Email already in use." });
      return;
    }

    const existingUsername = await findUserByUsername(username);
    if (existingUsername) {
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
    };

    await createUser(newUser);
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default registerUser;
