import { Router } from "express";
import {
  autocomplete,
  getCredits,
  getDetails,
  getImages,
  getLatest,
  getSimilar,
  getTrending,
  getUpcoming,
  getVideos,
  getWatchProviders,
  ingestCatalog,
  search,
} from "../controllers/movie.controller.js";
import { authenticate } from "../middleware/auth.js";
import { getRecommendations } from "../controllers/recommendation.controller.js";

const router = Router();

router.get("/trending", getTrending);
router.get("/latest", getLatest);
router.get("/upcoming", getUpcoming);
router.get("/search", search);
router.get("/autocomplete", autocomplete);

router.post("/ingest", ingestCatalog);

router.get("/:tmdbId/credits", getCredits);
router.get("/:tmdbId/videos", getVideos);
router.get("/:tmdbId/images", getImages);
router.get("/:tmdbId/similar", getSimilar);
router.get("/:tmdbId/watch/providers", getWatchProviders);
router.get("/recommendations", authenticate, getRecommendations);
router.get("/:tmdbId", getDetails);

export default router;
