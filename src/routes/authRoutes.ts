import express from "express";
import registerUser from "../controllers/registerController";
import loginUser from "../controllers/loginController";
import {
  refreshAccessToken,
  refreshToken,
} from "../controllers/refreshTokenController";
import { verifyEmail } from "../controllers/verifyEmailController";
import { resendOTC } from "../controllers/resendOTCController";
import { logoutUser } from "../controllers/logoutController";

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.post("/refresh", refreshToken); // ✅ Refresh token route
router.post("/resend-otc", resendOTC);
router.post("/refresh-access-token", refreshAccessToken);
router.post("/logout", logoutUser);

export default router;
