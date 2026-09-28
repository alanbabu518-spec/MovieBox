import { z } from "zod";

export const createReviewSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Review content is required")
    .max(2000, "Review is too long"),

  rating: z
    .number()
    .int()
    .min(1)
    .max(5),
});