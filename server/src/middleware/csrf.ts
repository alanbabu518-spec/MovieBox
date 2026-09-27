import { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";

const unsafeMethods = new Set([
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
]);

export const csrfProtection = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!unsafeMethods.has(req.method)) {
    next();
    return;
  }

  const origin = req.headers.origin;

  if (!origin) {
    next();
    return;
  }

  if (origin !== env.clientUrl) {
    next(
      new AppError(
        "Invalid request origin",
        403,
      ),
    );
    return;
  }

  next();
};