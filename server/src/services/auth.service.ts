import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";
import { generateEmailOTP } from "../utils/emailOtp.js";
import { sendVerificationEmail } from "./email.service.js";
import {
  createPendingRegistration,
  deletePendingRegistration,
  getPendingRegistration,
  verifyPendingOTP,
} from "./pendingRegistration.service.js";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type VerifyEmailOTPInput = {
  email: string;
  otp: string;
};

const createToken = (userId: string) => {
  return jwt.sign({ userId }, env.jwtSecret, {
    algorithm: "HS256",
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
};

export const registerUser = async ({
  name,
  email,
  password,
}: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  let existingPendingRegistration = null;

  try {
    existingPendingRegistration = await getPendingRegistration(email);
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 400) {
      existingPendingRegistration = null;
    } else {
      throw error;
    }
  }

  if (existingPendingRegistration) {
    throw new AppError(
      "A verification OTP was already sent. Please use resend OTP.",
      409,
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const otp = generateEmailOTP();

  await createPendingRegistration({
    name,
    email,
    passwordHash,
    otp: otp.code,
  });

  await sendVerificationEmail({
    email,
    name,
    otp: otp.code,
  });

  return {
    email,
    message: "OTP sent successfully",
  };
};

export const verifyEmailOTP = async ({ email, otp }: VerifyEmailOTPInput) => {
  const pendingRegistration = await verifyPendingOTP(email, otp);

  const user = await prisma.user.create({
    data: {
      name: pendingRegistration.name,
      email: pendingRegistration.email,
      passwordHash: pendingRegistration.passwordHash,
      emailVerified: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  await deletePendingRegistration(email);

  return {
    user,
    token: createToken(user.id),
  };
};

export const resendEmailOTP = async (email: string) => {
  const pendingRegistration = await getPendingRegistration(email);

  const otp = generateEmailOTP();

  await createPendingRegistration({
    name: pendingRegistration.name,
    email: pendingRegistration.email,
    passwordHash: pendingRegistration.passwordHash,
    otp: otp.code,
  });

  await sendVerificationEmail({
    email: pendingRegistration.email,
    name: pendingRegistration.name,
    otp: otp.code,
  });
};

export const loginUser = async ({ email, password }: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.emailVerified) {
    throw new AppError("Please verify your email before logging in", 403);
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    },
    token: createToken(user.id),
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
