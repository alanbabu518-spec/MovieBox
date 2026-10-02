import { Router } from "express";

import {
  getRatingStats,
  rateMovie,
} from "./rating.controller.js";

import { authenticate } from "../../middleware/auth.js";

const router = Router();

router.get(
  "/:tmdbId/ratings",
  authenticate,
  getRatingStats,
);

router.post(
  "/:tmdbId/ratings",
  authenticate,
  rateMovie,
);

export default router;