import { Router } from "express";
import { getRecommendations } from "../controllers/recommendation.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get(
  "/recommendations",
  authenticate,
  getRecommendations,
);

export default router;