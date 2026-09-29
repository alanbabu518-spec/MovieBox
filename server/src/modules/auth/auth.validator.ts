import { z } from "zod";

export const emailAuthSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

export const magicLinkSchema = z.object({
  token: z.string().min(1, "Authentication token is required"),
});