import { Request } from "express";
import { tokenBucket } from "./tokenBucket.js";

const getIp = (req: Request) =>
  req.ip ?? "unknown";

const getEmail = (req: Request) =>
  typeof req.body?.email === "string"
    ? req.body.email.trim().toLowerCase()
    : "unknown";

export const loginRateLimiter = tokenBucket({
  keyPrefix: "login",
  capacity: 5,
  refillRate: 1 / 30,
  getKeys: (req) => [
    `ip:${getIp(req)}`,
    `email:${getEmail(req)}`,
  ],
});

export const registerRateLimiter = tokenBucket({
  keyPrefix: "register",
  capacity: 3,
  refillRate: 1 / 120,
  getKeys: (req) => [
    `ip:${getIp(req)}`,
    `email:${getEmail(req)}`,
  ],
});

export const otpRateLimiter = tokenBucket({
  keyPrefix: "otp",
  capacity: 5,
  refillRate: 1 / 30,
  getKeys: (req) => [
    `ip:${getIp(req)}`,
    `email:${getEmail(req)}`,
  ],
});

export const resendOtpRateLimiter = tokenBucket({
  keyPrefix: "resend-otp",
  capacity: 2,
  refillRate: 1 / 120,
  getKeys: (req) => [
    `ip:${getIp(req)}`,
    `email:${getEmail(req)}`,
  ],
});