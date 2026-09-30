import type {
  NextFunction,
  Request,
  Response,
} from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { AppError } from "../shared/utils/appError.js";

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.[env.cookieName];

  if (!token) {
    next(new AppError("Authentication required", 401));
    return;
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
      next(new AppError("Invalid authentication token", 401));
      return;
    }

    (req as AuthenticatedRequest).userId = payload.userId;

    next();
  } catch {
    next(new AppError("Invalid or expired authentication token", 401));
  }
};