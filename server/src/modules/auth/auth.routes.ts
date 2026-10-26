import { Router } from "express";

import {
  getCurrentUser,
  googleCallback,
  googleLogin,
  logout,
  requestEmailLogin,
  verifyEmailMagicLink,
} from "./auth.controller.js";

import { updateUserProfile } from "./profile.controller.js";
import { authenticate } from "../../middleware/auth.js";

import {
  emailLoginRateLimiter,
  googleOAuthRateLimiter,
  magicLinkVerifyRateLimiter,
} from "../../middleware/authRateLimit.js";

const router = Router();

// Request a magic link, with rate limiting.
router.post("/email", emailLoginRateLimiter, requestEmailLogin);

// Verify a magic link, with rate limiting.
router.get("/verify", magicLinkVerifyRateLimiter, verifyEmailMagicLink);

// Start Google OAuth, with rate limiting.
router.get("/google", googleOAuthRateLimiter, googleLogin);

// Handle Google's OAuth callback, with rate limiting.
router.get("/google/callback", googleOAuthRateLimiter, googleCallback);

// Require authentication to access the current user's profile.
router.get("/me", authenticate, getCurrentUser);

// Require authentication to update the user's profile.
router.patch("/profile", authenticate, updateUserProfile);

// Clear the authentication cookie on logout.
router.post("/logout", logout);

export default router;
