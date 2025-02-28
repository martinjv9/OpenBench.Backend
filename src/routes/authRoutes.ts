import express from "express";
import registerUser from "../controllers/registerController";
import loginUser from "../controllers/loginController";
import { refreshToken } from "../controllers/refreshTokenController";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken); // ✅ Refresh token route

export default router;
