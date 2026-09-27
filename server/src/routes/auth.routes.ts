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
import {
  loginRateLimiter,
  otpRateLimiter,
  registerRateLimiter,
  resendOtpRateLimiter,
} from "../middleware/authRateLimit.js";

const router = Router();

router.post("/register", registerRateLimiter, register);
router.post("/login", loginRateLimiter, login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);
router.post("/verify-email", otpRateLimiter, verifyEmail);
router.post("/resend-otp", resendOtpRateLimiter, resendOTP);

export default router;
