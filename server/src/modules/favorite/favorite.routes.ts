import { Router } from "express";

import { authenticate } from "../../middleware/auth.js";

import {
  addMovieToFavorites,
  removeMovieFromFavorites,
  getUserFavorites,
  getFavoriteStatus,
} from "./favorite.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getUserFavorites);

router.get("/:tmdbId/status", getFavoriteStatus);

router.post("/", addMovieToFavorites);

router.delete("/:tmdbId", removeMovieFromFavorites);

export default router;