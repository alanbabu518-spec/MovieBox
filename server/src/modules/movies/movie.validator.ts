import { z } from "zod";

const searchQuerySchema = z
  .string()
  .trim()
  .min(1, "Search query is required")
  .max(100, "Search query must not exceed 100 characters")
  .refine(
    (value) => !/[\u0000-\u001F\u007F]/.test(value),
    "Search query contains invalid control characters",
  );

const positiveInteger = (
  minimum: number,
  maximum: number,
  defaultValue: number,
) =>
  z.preprocess(
    (value) => (value === undefined || value === "" ? defaultValue : value),
    z.coerce.number().int("Value must be an integer").min(minimum).max(maximum),
  );

export const searchMoviesSchema = z
  .object({
    query: searchQuerySchema,
    page: positiveInteger(1, 500, 1),
  })
  .strict();

export const autocompleteMoviesSchema = z
  .object({
    query: searchQuerySchema,
    limit: positiveInteger(1, 10, 5),
  })
  .strict();
