import { Router } from "express";
import {
  login,
  logout,
  me,
  register,
  resendOTP,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticate, me);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);

export default router;