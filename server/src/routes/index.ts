import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import movieRoutes from "../modules/movies/movie.routes.js";
import reviewRoutes from "../modules/reviews/review.routes.js";
import aiRoutes from "../modules/ai/ai.routes.js";
import watchlistRoutes from "../modules/watchlist/watchlist.routes.js";
import favoriteRoutes from "../modules/favorite/favorite.routes.js";

import { csrfProtection } from "../middleware/csrf.js";

const router = Router();

// Protect state-changing requests across API routes.
router.use(csrfProtection);

router.use("/auth", authRoutes);
router.use("/movies", movieRoutes);
router.use("/movies", reviewRoutes);
router.use("/ai", aiRoutes);
router.use("/watchlist", watchlistRoutes);
router.use("/favorites", favoriteRoutes);

export default router;
