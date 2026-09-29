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

const router = Router();

router.post("/email", requestEmailLogin);
router.get("/verify", verifyEmailMagicLink);
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.get("/me", authenticate, getCurrentUser);
router.patch("/profile", authenticate, updateUserProfile);
router.post("/logout", logout);

export default router;
