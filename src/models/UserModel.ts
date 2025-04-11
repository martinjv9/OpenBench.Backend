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
  role: string;
  //verified: boolean;
}

// Create a new user in MySQL
export const createUser = async (user: User): Promise<number> => {
  const query =
    "INSERT INTO users (username, first_name, last_name, email, password, security_question_1, answer_1, security_question_2, answer_2) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

  const params = [
    user.username,
    user.first_name,
    user.last_name,
    user.email,
    user.password,
    user.security_question_1,
    user.answer_1,
    user.security_question_2,
    user.answer_2,
  ];

  const [result] = (await pool.execute(query, params)) as any;
  if (result.affectedRows === 0) {
    throw new Error("Failed to create user");
  }
  return result.insertId as number;
};

// Find user by email
export const findUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (!rows || rows.length === 0) {
      return null;
    }

    return rows[0] as User;
  } catch (error) {
    console.error("❌ Database Error in findUserByEmail:", error);
    throw new Error("Database query failed");
  }
};

// Find user by username
export const findUserByUsername = async (
  username: string
): Promise<User | null> => {
  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (!rows || rows.length === 0) {
      return null;
    }

    return rows[0] as User;
  } catch (error) {
    console.error("❌ Database Error in findUserByUsername:", error);
    throw new Error("Database query failed");
  }
};

export const findUserById = async (id: number): Promise<User | null> => {
  try {
    const query = "SELECT * FROM users WHERE id = ?";
    const params = [id];
    const [rows]: any = await pool.query(query, params);

    if (!rows || rows.length === 0) {
      return null;
    }

    return rows[0] as User;
  } catch (error) {
    console.error("❌ Database Error in findUserById:", error);
    throw new Error("Database query failed");
  }
};
