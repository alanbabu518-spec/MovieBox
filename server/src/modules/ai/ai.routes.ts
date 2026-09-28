import { Router } from "express";
import { askMovieAssistant } from "./ai.controller.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();

router.post(
  "/:tmdbId/ai",
  authenticate,
  askMovieAssistant,
);

export default router;