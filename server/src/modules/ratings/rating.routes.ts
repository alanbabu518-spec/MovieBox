import { Router } from "express";
import {
  getRatingStats,
  rateMovie,
} from "./rating.controller.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();

router.get(
  "/:tmdbId/rating",
  getRatingStats,
);

router.post(
  "/:tmdbId/rating",
  authenticate,
  rateMovie,
);

export default router;