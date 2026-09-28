import { Router } from "express";
import {
  addReview,
  getReviews,
} from "../controllers/review.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/:tmdbId/reviews", getReviews);
router.post(
  "/:tmdbId/reviews",
  authenticate,
  addReview,
);

export default router;