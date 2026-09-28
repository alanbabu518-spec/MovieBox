import { Router } from "express";

import authRoutes from "./auth.routes.js";
import movieRoutes from "./movie.routes.js";
import reviewRoutes from "./review.routes.js";
import ratingRoutes from "./rating.routes.js";
import recommendationRoutes from "./recommendation.routes.js";
import aiRoutes from "./ai.routes.js";

const router = Router();

router.use("/auth", authRoutes);

router.use("/movies", movieRoutes);
router.use("/movies", reviewRoutes);
router.use("/movies", ratingRoutes);
router.use("/movies", recommendationRoutes);
router.use("/movies", aiRoutes);

export default router;