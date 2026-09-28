import { Router } from "express";
import {
  autocomplete,
  getLatest,
  getTrending,
  getUpcoming,
  ingestCatalog,
  search,
} from "../controllers/movie.controller.js";

const router = Router();

router.get("/trending", getTrending);
router.get("/latest", getLatest);
router.get("/upcoming", getUpcoming);
router.get("/search", search);
router.get("/autocomplete", autocomplete);
router.post("/ingest", ingestCatalog);

export default router;