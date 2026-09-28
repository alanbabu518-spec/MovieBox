import { Router } from "express";
import authRoutes from "./auth.routes.js";
import movieRoutes from "./movie.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/movies", movieRoutes);

export default router;