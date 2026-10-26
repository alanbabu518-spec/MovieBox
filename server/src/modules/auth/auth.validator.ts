import { z } from "zod";

export const emailAuthSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .transform((email) => email.toLowerCase()),
});

export const magicLinkSchema = z.object({
  token: z.string().trim().min(1, "Authentication token is required"),
});
