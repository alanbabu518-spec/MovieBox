import type { Request, Response } from "express";

import { env } from "../../config/env.js";

import {
  createAuthToken,
  requestMagicLink,
  verifyMagicLink,
} from "./auth.service.js";

import {
  authenticateWithGoogle,
  getGoogleAuthorizationUrl,
} from "./google.service.js";

import { emailAuthSchema } from "./auth.validator.js";

import { prisma } from "../../config/database.js";

import type { AuthenticatedRequest } from "../../shared/types/auth.js";

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export const requestEmailLogin = async (
  req: Request,
  res: Response,
) => {
  const { email } =
    emailAuthSchema.parse(req.body);

  const result =
    await requestMagicLink(email);

  return res.status(200).json({
    success: true,
    data: result,
  });
};

export const googleLogin = async (
  _req: Request,
  res: Response,
) => {
  const authorizationUrl =
    getGoogleAuthorizationUrl();

  return res.redirect(
    302,
    authorizationUrl,
  );
};

export const googleCallback = async (
  req: Request,
  res: Response,
) => {
  const code = req.query.code;

  if (
    typeof code !== "string" ||
    !code
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Google authorization code is missing",
    });
  }

  const result =
    await authenticateWithGoogle(code);

  const token = createAuthToken(
    result.user.id,
  );

  res.cookie(
    env.cookieName,
    token,
    cookieOptions,
  );

  return res.redirect(env.clientUrl);
};

export const verifyEmailMagicLink =
  async (
    req: Request,
    res: Response,
  ) => {
    const token = req.query.token;

    if (
      typeof token !== "string" ||
      !token
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Authentication token is missing",
      });
    }

    const result =
      await verifyMagicLink(token);

    res.cookie(
      env.cookieName,
      result.token,
      cookieOptions,
    );

    return res.redirect(env.clientUrl);
  };

export const getCurrentUser = async (
  req: Request,
  res: Response,
) => {
  const userId =
    (req as AuthenticatedRequest)
      .userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message:
        "Authentication required",
    });
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        avatar: true,
        profileCompleted: true,
        createdAt: true,
      },
    });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
};

export const logout = async (
  _req: Request,
  res: Response,
) => {
  res.clearCookie(
    env.cookieName,
    {
      httpOnly: true,
      secure:
        env.nodeEnv === "production",
      sameSite: "lax",
      path: "/",
    },
  );

  return res.status(200).json({
    success: true,
    message:
      "Logged out successfully",
  });
};