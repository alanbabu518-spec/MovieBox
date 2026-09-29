import api from "./api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  avatar: string;
  profileCompleted: boolean;
  createdAt: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: AuthUser;
  };
}

interface MagicLinkResponse {
  success: boolean;
  data: {
    message: string;
  };
}

interface ProfileResponse {
  success: boolean;
  data: {
    user: AuthUser;
  };
}

export async function requestMagicLink(
  email: string,
): Promise<string> {
  const response = await api.post<MagicLinkResponse>(
    "/auth/email",
    { email },
  );

  return response.data.data.message;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get<AuthResponse>(
    "/auth/me",
  );

  return response.data.data.user;
}

export async function updateProfile(
  name: string,
  avatar: string,
): Promise<AuthUser> {
  const response = await api.patch<ProfileResponse>(
    "/auth/profile",
    {
      name,
      avatar,
    },
  );

  return response.data.data.user;
}

export async function logoutUser(): Promise<void> {
  await api.post("/auth/logout");
}