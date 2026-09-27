import { Request, Response } from "express";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../services/auth.service.js";
import {
  loginSchema,
  registerSchema,
} from "../validators/auth.validator.js";
import { AuthenticatedRequest } from "../types/auth.js";
import { AppError } from "../utils/appError.js";
import { env } from "../config/env.js";

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export const register = async (
  req: Request,
  res: Response
) => {
  const data = registerSchema.parse(req.body);

  const result = await registerUser(data);

  res.cookie(
    env.cookieName,
    result.token,
    cookieOptions
  );

  res.status(201).json({
    success: true,
    data: {
      user: result.user,
    },
  });
};

export const login = async (
  req: Request,
  res: Response
) => {
  const data = loginSchema.parse(req.body);

  const result = await loginUser(data);

  res.cookie(
    env.cookieName,
    result.token,
    cookieOptions
  );

  res.status(200).json({
    success: true,
    data: {
      user: result.user,
    },
  });
};

export const me = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.userId) {
    throw new AppError("Authentication required", 401);
  }

  const user = await getCurrentUser(req.userId);

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
};

export const logout = (
  _req: Request,
  res: Response
) => {
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};