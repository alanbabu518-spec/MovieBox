import { Router } from "express";
import {
  getLatest,
  getTrending,
  getUpcoming,
  search,
} from "../controllers/movie.controller.js";

const router = Router();

router.get("/trending", getTrending);
router.get("/latest", getLatest);
router.get("/upcoming", getUpcoming);
router.get("/search", search);

export default router;