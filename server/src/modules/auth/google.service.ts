import { OAuth2Client } from "google-auth-library";

import { prisma } from "../../config/database.js";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/utils/appError.js";

const googleClient = new OAuth2Client(
  env.googleClientId,
  env.googleClientSecret,
  env.googleCallbackUrl,
);

export const getGoogleAuthorizationUrl = () => {
  return googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    prompt: "select_account",
  });
};

export const authenticateWithGoogle = async (code: string) => {
  const { tokens } = await googleClient.getToken(code);

  if (!tokens.id_token) {
    throw new AppError("Google authentication failed", 401);
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.googleClientId,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new AppError("Invalid Google account information", 401);
  }

  if (!payload.sub || !payload.email) {
    throw new AppError(
      "Google account information is incomplete",
      400,
    );
  }

  const email = payload.email.toLowerCase().trim();

  const name =
    typeof payload.name === "string" && payload.name.trim().length > 0
      ? payload.name.trim()
      : email.split("@")[0] ?? "Google User";

  const providerId = payload.sub;

  let user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        authProvider: "google",
        providerId,
        emailVerified: true,
        profileCompleted: false,
      },
    });
  } else {
    if (
      user.authProvider === "google" &&
      user.providerId !== providerId
    ) {
      throw new AppError(
        "Google account does not match this MovieBox account",
        401,
      );
    }

    if (!user.emailVerified) {
      user = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailVerified: true,
        },
      });
    }
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
  };
};