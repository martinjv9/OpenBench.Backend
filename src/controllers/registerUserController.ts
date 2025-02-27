import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import validator from "validator";
import { createUser, User, findUserByEmail } from "../models/UserModel";
import dotenv from "dotenv";

dotenv.config();

const PEPPER_SECRET = process.env.PEPPER_SECRET || "";
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);

    // Validate Input
    // check email/username uniqueness
    // hash, salt, pepper password
    // store to DB

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    
    try {
        const {username, fName, lName, email, pwd, security_question_1, answer_1, security_question_2, answer_2} = req.body;

        if(!username || !fName || !lName || !email || !pwd || !security_question_1 || !answer_1 || !security_question_2 || !answer_2) {
            res.status(400).json({"message": "All fields required"});
        }

        // Username validation: 3-50 characters, alphanumeric
    if (!validator.isLength(username, { min: 3, max: 50 }) || !validator.isAlphanumeric(username)) {
        res.status(400).json({ message: "Username must be alphanumeric and between 3-50 characters." });
      }

      // First & Last Name: Only letters, 2-50 characters
      if (!validator.isAlpha(fName) || !validator.isLength(fName, { min: 2, max: 50 })) {
        res.status(400).json({ message: "First name must be only letters and between 2-50 characters." });
      }
      if (!validator.isAlpha(lName) || !validator.isLength(lName, { min: 2, max: 50 })) {
        res.status(400).json({ message: "Last name must be only letters and between 2-50 characters." });
      }

      // Email validation
    if (!validator.isEmail(email)) {
         res.status(400).json({ message: "Invalid email format." });
      }
  
      // Strong password: At least 8 characters, including uppercase, lowercase, number, and special character
      if (!validator.isStrongPassword(pwd, { minLength: 8, minUppercase: 1, minLowercase: 1, minNumbers: 1, minSymbols: 1 })) {
         res.status(400).json({ message: "Password must be at least 8 characters long and include an uppercase letter, a number, and a special character." });
      }
  
      // Security questions must be at least 10 characters
      if (!validator.isLength(security_question_1, { min: 10 }) || !validator.isLength(security_question_2, { min: 10 })) {
         res.status(400).json({ message: "Security questions must be at least 10 characters long." });
      }
  
      // Security answers must be at least 3 characters
      if (!validator.isLength(answer_1, { min: 3 }) || !validator.isLength(answer_2, { min: 3 })) {
         res.status(400).json({ message: "Security answers must be at least 3 characters long." });
      }

      // Sanitize inputs to prevent injection attacks
    const safeUsername = validator.escape(username);
    const safeFirstName = validator.escape(fName);
    const safeLastName = validator.escape(lName);
    const safeEmail = validator.normalizeEmail(email);
    const safeSecurityQuestion1 = validator.escape(security_question_1);
    const safeAnswer1 = validator.escape(answer_1);
    const safeSecurityQuestion2 = validator.escape(security_question_2);
    const safeAnswer2 = validator.escape(answer_2);

    // Hash password and security answers
    const hashedPassword = await bcrypt.hash(pwd, 10);
    const hashedAnswer1 = await bcrypt.hash(answer_1, 10);
    const hashedAnswer2 = await bcrypt.hash(answer_2, 10);
        
    } catch(error) {
        res.status(500).json({"message": "Error registering user", error: (error as Error).message})

    }
    
  };

export default registerUser;
