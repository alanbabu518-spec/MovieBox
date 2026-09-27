import { Request, Response, NextFunction } from "express";
import { consumeToken } from "../services/rateLimit.service.js";

type TokenBucketOptions = {
  keyPrefix: string;
  capacity: number;
  refillRate: number;
  getKeys?: (req: Request) => string[];
};

export const tokenBucket = ({
  keyPrefix,
  capacity,
  refillRate,
  getKeys = (req) => [req.ip ?? "unknown"],
}: TokenBucketOptions) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const identifiers = getKeys(req);

      const results = await Promise.all(
        identifiers.map((identifier) =>
          consumeToken({
            key: `moviebox:rate-limit:${keyPrefix}:${identifier}`,
            capacity,
            refillRate,
          })
        )
      );

      const rejected = results.find(
        (result) => !result.allowed
      );

      res.setHeader(
        "X-RateLimit-Limit",
        capacity.toString()
      );

      res.setHeader(
        "X-RateLimit-Remaining",
        Math.min(
          ...results.map((result) => result.remaining)
        ).toString()
      );

      if (rejected) {
        res.setHeader(
          "Retry-After",
          rejected.retryAfter.toString()
        );

        res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
          retryAfter: rejected.retryAfter,
        });

        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};