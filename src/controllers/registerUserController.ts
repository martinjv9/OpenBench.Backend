import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { createUser, User, findUserByEmail } from "../models/UserModel";
import dotenv from "dotenv";

    // Validate Input
    // check email/username uniqueness
    // hash, salt, pepper password
    // store to DB

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    
    try {
        const {username, fName, lName, email, pwd, security_question_1, answer_1, security_question_2, answer_2} = req.body;

        
    } catch(error) {
        res.status(500).json({"message": "Error registering user", error: (error as Error).message})
        
    }
    
  };

export default registerUser;
