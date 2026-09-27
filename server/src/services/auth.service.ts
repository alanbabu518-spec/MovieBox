import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";
import { generateEmailOTP } from "../utils/emailOtp.js";
import { sendVerificationEmail } from "./email.service.js";

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

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  const otp = generateEmailOTP();

  await prisma.movieBoxEmailOTP.create({
    data: {
      codeHash: otp.codeHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  await sendVerificationEmail({
    email: user.email,
    name: user.name,
    otp: otp.code,
  });

  return {
    user,
    token: createToken(user.id),
  };
};

export const verifyEmailOTP = async ({
  email,
  otp,
}: VerifyEmailOTPInput) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.emailVerified) {
    throw new AppError("Email is already verified", 400);
  }

  const otpRecord = await prisma.movieBoxEmailOTP.findFirst({
    where: {
      userId: user.id,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!otpRecord) {
    throw new AppError("OTP expired or not found", 400);
  }

  if (otpRecord.attempts >= 5) {
    throw new AppError("Too many OTP attempts", 429);
  }

  const codeHash = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  if (codeHash !== otpRecord.codeHash) {
    await prisma.movieBoxEmailOTP.update({
      where: { id: otpRecord.id },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });

    throw new AppError("Invalid OTP", 400);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
      },
    }),
    prisma.movieBoxEmailOTP.delete({
      where: { id: otpRecord.id },
    }),
  ]);

  return {
    id: user.id,
    email: user.email,
    emailVerified: true,
  };
};

export const loginUser = async ({
  email,
  password,
}: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
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