import { z } from "zod";

export const createRatingSchema = z.object({
  value: z
    .number()
    .int()
    .min(1)
    .max(5),
});