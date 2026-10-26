import { createHash, timingSafeEqual } from "node:crypto";
import { redis } from "../../config/redis.js";

const PENDING_REGISTRATION_PREFIX =
  "moviebox:pending-registration:";

const PENDING_REGISTRATION_TTL_SECONDS = 600;
const MAX_OTP_ATTEMPTS = 5;

export interface PendingRegistrationInput {
  name: string;
  email: string;
  passwordHash: string;
  otp: string;
}

export interface PendingRegistration {
  name: string;
  email: string;
  passwordHash: string;
  otpHash: string;
  attempts: number;
}

/**
 * Creates the Redis key for a pending registration.
 */
function getPendingRegistrationKey(email: string): string {
  return `${PENDING_REGISTRATION_PREFIX}${email
    .trim()
    .toLowerCase()}`;
}

/**
 * Hashes an OTP using SHA-256.
 */
function hashOTP(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

/**
 * Compares OTP hashes without an ordinary string comparison.
 */
function compareOTPHashes(
  storedHash: string,
  suppliedHash: string,
): boolean {
  if (!/^[a-f0-9]{64}$/i.test(storedHash)) {
    return false;
  }

  const storedBuffer = Buffer.from(storedHash, "hex");
  const suppliedBuffer = Buffer.from(suppliedHash, "hex");

  return (
    storedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(storedBuffer, suppliedBuffer)
  );
}

/**
 * Stores a pending registration in Redis for 10 minutes.
 */
export async function createPendingRegistration(
  input: PendingRegistrationInput,
): Promise<void> {
  const email = input.email.trim().toLowerCase();

  const registration: PendingRegistration = {
    name: input.name,
    email,
    passwordHash: input.passwordHash,
    otpHash: hashOTP(input.otp),
    attempts: 0,
  };

  await redis.set(
    getPendingRegistrationKey(email),
    JSON.stringify(registration),
    "EX",
    PENDING_REGISTRATION_TTL_SECONDS,
  );
}

/**
 * Retrieves a pending registration from Redis.
 */
export async function getPendingRegistration(
  email: string,
): Promise<PendingRegistration> {
  const key = getPendingRegistrationKey(email);
  const value = await redis.get(key);

  if (!value) {
    throw new Error(
      "OTP expired or registration not found",
    );
  }

  return JSON.parse(value) as PendingRegistration;
}

/**
 * Increments failed OTP attempts while preserving the remaining TTL.
 */
export async function incrementOTPAttempts(
  email: string,
): Promise<void> {
  const key = getPendingRegistrationKey(email);
  const registration = await getPendingRegistration(email);
  const ttl = await redis.ttl(key);

  if (ttl <= 0) {
    await redis.del(key);

    throw new Error(
      "OTP expired or registration not found",
    );
  }

  registration.attempts += 1;

  await redis.set(
    key,
    JSON.stringify(registration),
    "EX",
    ttl,
  );
}

/**
 * Verifies an OTP against the stored hash.
 */
export async function verifyPendingOTP(
  email: string,
  otp: string,
): Promise<PendingRegistration> {
  const registration = await getPendingRegistration(email);

  if (registration.attempts >= MAX_OTP_ATTEMPTS) {
    throw new Error("Too many OTP attempts");
  }

  const suppliedHash = hashOTP(otp);

  if (
    !compareOTPHashes(
      registration.otpHash,
      suppliedHash,
    )
  ) {
    await incrementOTPAttempts(email);

    throw new Error("Invalid OTP");
  }

  return registration;
}

/**
 * Deletes a pending registration from Redis.
 */
export async function deletePendingRegistration(
  email: string,
): Promise<void> {
  await redis.del(getPendingRegistrationKey(email));
}