import type { NextFunction, Request, Response } from "express";

import { prisma } from "../config/database.js";
import { AppError } from "../shared/utils/appError.js";
import type { AuthenticatedRequest } from "./auth.js";

export const requireAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;

    if (!userId) {
      next(new AppError("Authentication required", 401));
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      next(new AppError("User not found", 401));
      return;
    }

    if (user.role !== "ADMIN") {
      next(new AppError("Administrator access required", 403));
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};