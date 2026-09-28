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

const router = Router();

router.get("/trending", getTrending);
router.get("/latest", getLatest);
router.get("/upcoming", getUpcoming);
router.get("/search", search);
router.get("/autocomplete", autocomplete);

router.get("/:tmdbId/credits", getCredits);
router.get("/:tmdbId/videos", getVideos);
router.get("/:tmdbId/images", getImages);
router.get("/:tmdbId/similar", getSimilar);
router.get("/:tmdbId/watch/providers", getWatchProviders);
router.get("/:tmdbId", getDetails);

router.post("/ingest", ingestCatalog);

export default router;