import { Router } from "express";
import {
  getLatest,
  getTrending,
  getUpcoming,
} from "../controllers/movie.controller.js";

const router = Router();

router.get("/trending", getTrending);
router.get("/latest", getLatest);
router.get("/upcoming", getUpcoming);

export default router;