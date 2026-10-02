import { Router } from "express";

import { authenticate } from "../../middleware/auth.js";

import {
  askMovieAssistant,
  searchWithAI,
  getAIRecommendationResults,
  chatWithMovieAssistant,
} from "./ai.controller.js";

const router = Router();

router.post(
  "/search",
  authenticate,
  searchWithAI,
);

router.get(
  "/recommendations",
  authenticate,
  getAIRecommendationResults,
);

router.post(
  "/:tmdbId/ai",
  authenticate,
  askMovieAssistant,
);

router.post(
  "/chat",
  authenticate,
  chatWithMovieAssistant,
);

export default router;