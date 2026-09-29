import { prisma } from "../../config/database.js";
import { AppError } from "../../shared/utils/appError.js";

const availableAvatars = [
  "avatar-1",
  "avatar-2",
  "avatar-3",
  "avatar-4",
  "avatar-5",
  "avatar-6",
  "avatar-7",
  "avatar-8",
  "avatar-9",
  "avatar-10",
];

export const updateProfile = async (
  userId: string,
  name: string,
  avatar: string,
) => {
  const trimmedName = name.trim();

  if (trimmedName.length < 2 || trimmedName.length > 30) {
    throw new AppError(
      "Username must be between 2 and 30 characters",
      400,
    );
  }

  if (!availableAvatars.includes(avatar)) {
    throw new AppError("Invalid avatar selected", 400);
  }

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: trimmedName,
      avatar,
      profileCompleted: true,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    avatar: user.avatar,
    profileCompleted: user.profileCompleted,
    createdAt: user.createdAt,
  };
};