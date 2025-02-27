import pool from "../config/db";

// User interface with all fields
export interface User {
  id?: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  security_question_1: string;
  answer_1: string;
  security_question_2: string;
  answer_2: string;
}

// Create a new user in MySQL
export const createUser = async (user: User): Promise<void> => {
  await pool.query(
    "INSERT INTO users (username, first_name, last_name, email, password, security_question_1, answer_1, security_question_2, answer_2) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [user.username, user.first_name, user.last_name, user.email, user.password, user.security_question_1, user.answer_1, user.security_question_2, user.answer_2]
  );
};

// Find user by email
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const [rows]: any = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows.length ? rows[0] : null;
};
