import jwt from "jsonwebtoken";

import { prisma } from "../../config/database.js";
import { env } from "../../config/env.js";
import { sendMagicLinkEmail } from "../../email/email.service.js";
import { AppError } from "../../shared/utils/appError.js";
import {
  consumeMagicLinkToken,
  createMagicLinkToken,
} from "./magicLink.service.js";

export const requestMagicLink = async (email: string) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  const name =
    existingUser?.name ?? normalizedEmail.split("@")[0] ?? "MovieBox User";

  const token = await createMagicLinkToken(normalizedEmail);

  await sendMagicLinkEmail({
    email: normalizedEmail,
    name,
    token,
  });

  return {
    message: "If the email is valid, a sign-in link has been sent.",
  };
};

export const createAuthToken = (userId: string) => {
  if (!env.jwtExpiresIn) {
    throw new Error("JWT_EXPIRES_IN is not configured");
  }

  return jwt.sign(
    {
      userId,
    },
    env.jwtSecret,
    {
      algorithm: "HS256",
      expiresIn: env.jwtExpiresIn,
    },
  );
};

export const verifyMagicLink = async (token: string) => {
  const magicLink = await consumeMagicLinkToken(token);

  if (!magicLink) {
    throw new AppError("This sign-in link is invalid or has expired.", 400);
  }

  const email = magicLink.email;

  let user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: email.split("@")[0] ?? "MovieBox User",
        email,
        authProvider: "email",
        emailVerified: true,
        profileCompleted: false,
      },
    });
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      avatar: user.avatar,
      profileCompleted: user.profileCompleted,
      createdAt: user.createdAt,
    },
    token: createAuthToken(user.id),
  };
};
