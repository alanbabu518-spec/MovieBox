import { Router } from "express";
import { getTrending } from "../controllers/movie.controller.js";

const router = Router();

router.get("/trending", getTrending);

export default router;