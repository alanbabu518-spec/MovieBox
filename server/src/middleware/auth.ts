import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { prisma } from "../config/database.js";
import { AppError } from "../shared/utils/appError.js";

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.[env.cookieName];

  if (!token) {
    return next(new AppError("Authentication required", 401));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof payload.userId !== "string"
    ) {
      return next(new AppError("Invalid authentication token", 401));
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true },
    });

    if (!user) {
      res.clearCookie(env.cookieName, {
        httpOnly: true,
        secure: env.nodeEnv === "production",
        sameSite: "lax",
        path: "/",
      });

      return next(new AppError("Account no longer exists", 401));
    }

    (req as AuthenticatedRequest).userId = user.id;

    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Invalid or expired authentication token", 401));
    }

    return next(error);
  }
};
