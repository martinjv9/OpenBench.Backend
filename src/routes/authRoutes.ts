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
import { verifyOTC } from "../controllers/veriftyOTCController";
import { resendVerificationToken } from "../models/VerificationTokenModel";

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify-email", verifyEmail);
router.post("/resend-verify-email", resendVerificationToken)
router.post("/login", loginUser);
router.post("/verify-otc", verifyOTC);
router.post("/refresh", refreshToken);
router.post("/resend-otc", resendOTC); // Still need to test
router.post("/refresh-access-token", refreshAccessToken);
router.post("/logout", logoutUser);

export default router;
