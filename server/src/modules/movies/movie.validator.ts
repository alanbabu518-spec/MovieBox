import { z } from "zod";

export const searchMoviesSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, "Search query is required")
    .max(100, "Search query is too long"),

  page: z.coerce
    .number()
    .int()
    .min(1)
    .max(500)
    .default(1),
});

export const autocompleteMoviesSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, "Search query is required")
    .max(100, "Search query is too long"),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(10)
    .default(5),
});