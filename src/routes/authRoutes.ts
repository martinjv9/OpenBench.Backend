import express from "express";
import registerUser from "../controllers/registerController";
import loginUser from "../controllers/loginController";
import { refreshToken } from "../controllers/refreshTokenController";
import { verifyEmail } from "../controllers/verifyEmailController";

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.post("/refresh", refreshToken); // ✅ Refresh token route

export default router;
