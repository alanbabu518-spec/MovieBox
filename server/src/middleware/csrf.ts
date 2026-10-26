import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { AppError } from "../shared/utils/appError.js";

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const trustedOrigin = new URL(env.clientUrl).origin;

/**
 * Protects state-changing requests against Cross-Site Request Forgery.
 */
export const csrfProtection = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  // Safe HTTP methods do not modify application state.
  if (!unsafeMethods.has(req.method.toUpperCase())) {
    next();
    return;
  }

  const origin = req.get("origin");

  // Reject unsafe browser requests without an Origin header.
  if (!origin) {
    next(new AppError("Origin header is required for this request", 403));
    return;
  }

  let requestOrigin: string;

  try {
    requestOrigin = new URL(origin).origin;
  } catch {
    next(new AppError("Invalid request origin", 403));
    return;
  }

  // Require the configured frontend origin.
  if (requestOrigin !== trustedOrigin) {
    next(new AppError("Invalid request origin", 403));
    return;
  }

  // Reject requests explicitly identified as cross-site.
  const fetchSite = req.get("sec-fetch-site");

  if (fetchSite === "cross-site") {
    next(new AppError("Cross-site requests are not allowed", 403));
    return;
  }

  next();
};
