import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Username must be at least 2 characters")
    .max(30, "Username must be at most 30 characters"),
  avatar: z.string().min(1, "Avatar is required"),
});