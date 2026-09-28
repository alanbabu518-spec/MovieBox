import { Router } from "express";
import { getRecommendations } from "./recommendation.controller.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();

router.get(
  "/recommendations",
  authenticate,
  getRecommendations,
);

export default router;