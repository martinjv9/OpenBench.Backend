import express from "express";
import registerUser from "../controllers/registerUserController";

const router = express.Router();

router.post("/data", registerUser);

export default router;
