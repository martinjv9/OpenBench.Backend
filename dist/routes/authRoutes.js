"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const registerController_1 = __importDefault(require("../controllers/registerController"));
const loginController_1 = __importDefault(require("../controllers/loginController"));
const refreshTokenController_1 = require("../controllers/refreshTokenController");
const router = express_1.default.Router();
router.post("/register", registerController_1.default);
router.post("/login", loginController_1.default);
router.post("/refresh", refreshTokenController_1.refreshToken); // ✅ Refresh token route
exports.default = router;
