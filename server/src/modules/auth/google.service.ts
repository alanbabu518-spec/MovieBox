import crypto from "node:crypto";
import { OAuth2Client } from "google-auth-library";

import { prisma } from "../../config/database.js";
import { env } from "../../config/env.js";
import { redis } from "../../config/redis.js";
import { AppError } from "../../shared/utils/appError.js";

const OAUTH_STATE_TTL_SECONDS = 5 * 60;

const stateKey = (state: string) => `moviebox:oauth-state:${state}`;

const googleClient = new OAuth2Client(
  env.googleClientId,
  env.googleClientSecret,
  env.googleCallbackUrl,
);

export const getGoogleAuthorizationUrl = async () => {
  // Generate a cryptographically secure, unpredictable OAuth state.
  const state = crypto.randomBytes(32).toString("hex");

  // Store state once with a short expiration.
  const stored = await redis.set(
    stateKey(state),
    "1",
    "EX",
    OAUTH_STATE_TTL_SECONDS,
    "NX",
  );

  if (stored !== "OK") {
    throw new AppError(
      "Unable to initialize Google sign-in. Please try again.",
      503,
    );
  }

  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    prompt: "select_account",
    state,
  });

  return { url, state };
};

export const authenticateWithGoogle = async (code: string, state: string) => {
  // Validate the state format before accessing Redis.
  if (!/^[a-f0-9]{64}$/.test(state)) {
    throw new AppError("Invalid Google OAuth state", 401);
  }

  // Atomically consume state so it cannot be reused concurrently.
  const consumedState = await redis.eval(
    `
      local value = redis.call("GET", KEYS[1])
      if value then
        redis.call("DEL", KEYS[1])
      end
      return value or ""
    `,
    1,
    stateKey(state),
  );

  if (consumedState !== "1") {
    throw new AppError(
      "Google sign-in session expired or was already used",
      401,
    );
  }

  const { tokens } = await googleClient.getToken(code);

  if (!tokens.id_token) {
    throw new AppError("Google authentication failed", 401);
  }

  // Verify Google's signed identity token and its intended audience.
  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.googleClientId,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.sub || !payload.email) {
    throw new AppError("Google account information is incomplete", 401);
  }

  // Do not treat an unverified Google email as a verified account.
  if (payload.email_verified !== true) {
    throw new AppError("Your Google email address must be verified", 401);
  }

  const email = payload.email.trim().toLowerCase();

  const name =
    typeof payload.name === "string" && payload.name.trim().length > 0
      ? payload.name.trim()
      : email.split("@")[0] || "Google User";

  const providerId = payload.sub;

  let user = await prisma.user.findUnique({
    where: { email },
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
    // Do not silently link a different Google identity to an
    // account that already uses Google authentication.
    if (user.authProvider === "google" && user.providerId !== providerId) {
      throw new AppError(
        "Google account does not match this MovieBox account",
        401,
      );
    }

    if (!user.emailVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
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
