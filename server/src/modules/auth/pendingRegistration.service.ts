import crypto from "node:crypto";
import { redis } from "../../config/redis.js";
import { AppError } from "../../shared/utils/appError.js";

type PendingRegistration = {
  name: string;
  email: string;
  passwordHash: string;
  otpHash: string;
  attempts: number;
};

const getKey = (email: string) =>
  `moviebox:pending-registration:${email}`;

const hashOTP = (otp: string) =>
  crypto.createHash("sha256").update(otp).digest("hex");

export const createPendingRegistration = async ({
  name,
  email,
  passwordHash,
  otp,
}: {
  name: string;
  email: string;
  passwordHash: string;
  otp: string;
}) => {
  const data: PendingRegistration = {
    name,
    email,
    passwordHash,
    otpHash: hashOTP(otp),
    attempts: 0,
  };

  await redis.set(
    getKey(email),
    JSON.stringify(data),
    "EX",
    10 * 60
  );
};

export const getPendingRegistration = async (email: string) => {
  const data = await redis.get(getKey(email));

  if (!data) {
    throw new AppError("OTP expired or registration not found", 400);
  }

  return JSON.parse(data) as PendingRegistration;
};

export const incrementOTPAttempts = async (email: string) => {
  const key = getKey(email);
  const data = await getPendingRegistration(email);

  data.attempts += 1;

  const ttl = await redis.ttl(key);

  if (ttl <= 0) {
    throw new AppError("OTP expired or registration not found", 400);
  }

  await redis.set(
    key,
    JSON.stringify(data),
    "EX",
    ttl
  );
};

export const deletePendingRegistration = async (email: string) => {
  await redis.del(getKey(email));
};

export const verifyPendingOTP = async (
  email: string,
  otp: string
) => {
  const data = await getPendingRegistration(email);

  if (data.attempts >= 5) {
    throw new AppError("Too many OTP attempts", 429);
  }

  const otpHash = hashOTP(otp);

  if (otpHash !== data.otpHash) {
    await incrementOTPAttempts(email);
    throw new AppError("Invalid OTP", 400);
  }

  return data;
};