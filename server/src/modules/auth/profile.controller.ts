import { Response } from "express";

import { updateProfile } from "./profile.service.js";
import { updateProfileSchema } from "./profile.validator.js";
import { AuthenticatedRequest } from "../../shared/types/auth.js";

export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const { name, avatar } = updateProfileSchema.parse(req.body);

  const user = await updateProfile(
    userId,
    name,
    avatar,
  );

  return res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
};