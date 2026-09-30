import { Router } from "express";

import { authenticate } from "../../middleware/auth.js";

import {
  addMovieToWatchlist,
  removeMovieFromWatchlist,
  getUserWatchlist,
  getWatchlistStatus,
} from "./watchlist.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getUserWatchlist);

router.get("/:tmdbId/status", getWatchlistStatus);

router.post("/", addMovieToWatchlist);

router.delete("/:tmdbId", removeMovieFromWatchlist);

export default router;