import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import movieRoutes from "../modules/movies/movie.routes.js";
import reviewRoutes from "../modules/reviews/review.routes.js";
import ratingRoutes from "../modules/ratings/rating.routes.js";
import recommendationRoutes from "../modules/recommendations/recommendation.routes.js";
import aiRoutes from "../modules/ai/ai.routes.js";
import watchlistRoutes from "../modules/watchlist/watchlist.routes.js";
import favoriteRoutes from "../modules/favorite/favorite.routes.js";

const router = Router();

router.use("/auth", authRoutes);

router.use("/movies", movieRoutes);
router.use("/movies", reviewRoutes);
router.use("/movies", ratingRoutes);
router.use("/movies", recommendationRoutes);
router.use("/movies", aiRoutes);
router.use("/watchlist", watchlistRoutes);
router.use("/favorites", favoriteRoutes);

export default router;