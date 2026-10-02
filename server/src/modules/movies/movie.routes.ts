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
  getUpcoming,
  getVideos,
  getWatchProviders,
  ingestCatalog,
  search,
} from "../movies/movie.controller.js";

import { authenticate } from "../../middleware/auth.js";

import {
  getRecommendations,
} from "../recommendations/recommendation.controller.js";

import {
  getIndustryTrendingMovies,
} from "../../integrations/tmdb/tmdb.service.js";

import {
  isMovieIndustry,
} from "../../integrations/tmdb/industry.js";

const router = Router();

router.get("/trending", getTrending);

router.get(
  "/trending/:industry",
  async (req, res, next) => {
    try {
      const industry = req.params.industry;

      if (!isMovieIndustry(industry)) {
        return res.status(400).json({
          message: "Invalid movie industry",
        });
      }

      const result =
        await getIndustryTrendingMovies(
          industry,
        );

      return res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.get("/latest", getLatest);

router.get("/popular", getPopular);

router.get("/upcoming", getUpcoming);

router.get("/search", search);

router.get("/autocomplete", autocomplete);

router.post("/ingest", ingestCatalog);

router.get(
  "/:tmdbId/credits",
  getCredits,
);

router.get(
  "/:tmdbId/videos",
  getVideos,
);

router.get(
  "/:tmdbId/images",
  getImages,
);

router.get(
  "/:tmdbId/similar",
  getSimilar,
);

router.get(
  "/:tmdbId/watch/providers",
  getWatchProviders,
);

router.get(
  "/recommendations",
  authenticate,
  getRecommendations,
);

router.get(
  "/discover",
  getDiscover,
);

router.get(
  "/:tmdbId",
  getDetails,
);

export default router;