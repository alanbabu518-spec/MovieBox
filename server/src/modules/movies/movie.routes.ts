import { Router } from "express";

import {
  autocomplete,
  getCredits,
  getDetails,
  getDiscover,
  getImages,
  getLatest,
  getPopular,
  getSimilar,
  getTrending,
  getTMDBReviews,
  getUpcoming,
  getVideos,
  getWatchProviders,
  search,
} from "./movie.controller.js";

import { getIndustryTrendingMovies } from "../../integrations/tmdb/tmdb.service.js";
import { isMovieIndustry } from "../../integrations/tmdb/industry.js";
import { authenticate } from "../../middleware/auth.js";
import { getRecommendations } from "../recommendations/recommendation.controller.js";

const router = Router();

// Movie discovery.
router.get("/trending", getTrending);

router.get("/trending/:industry", async (req, res, next) => {
  try {
    const industry = req.params.industry;

    if (!isMovieIndustry(industry)) {
      return res.status(400).json({
        message: "Invalid movie industry",
      });
    }

    const result = await getIndustryTrendingMovies(industry);

    return res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/latest", getLatest);
router.get("/popular", getPopular);
router.get("/upcoming", getUpcoming);
router.get("/search", search);
router.get("/autocomplete", autocomplete);
router.get("/discover", getDiscover);

// Named routes must come before the dynamic /:tmdbId route.
router.get("/recommendations", authenticate, getRecommendations);

// Movie-specific routes.
router.get("/:tmdbId/credits", getCredits);
router.get("/:tmdbId/videos", getVideos);
router.get("/:tmdbId/images", getImages);
router.get("/:tmdbId/similar", getSimilar);
router.get("/:tmdbId/watch/providers", getWatchProviders);

// Reviews provided by TMDB.
router.get("/:tmdbId/tmdb-reviews", getTMDBReviews);

// Keep the general movie-details route last.
router.get("/:tmdbId", getDetails);

export default router;
