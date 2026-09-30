import api from "./api";

export interface FavoriteMovie {
  id: string;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  movieId: string;
  createdAt: string;
  movie: FavoriteMovie;
}

interface FavoritesResponse {
  success: boolean;
  data: {
    favorites: FavoriteItem[];
  };
}

interface FavoriteItemResponse {
  success: boolean;
  data: {
    favorite: FavoriteItem;
  };
}

interface FavoriteStatusResponse {
  success: boolean;
  data: {
    isFavorite: boolean;
  };
}

interface RemoveFavoriteResponse {
  success: boolean;
  data: {
    message: string;
  };
}

export async function getFavorites(): Promise<FavoriteItem[]> {
  const response =
    await api.get<FavoritesResponse>("/favorites");

  return response.data.data.favorites;
}

export async function addToFavorites(
  tmdbId: number,
): Promise<FavoriteItem> {
  const response =
    await api.post<FavoriteItemResponse>(
      "/favorites",
      { tmdbId },
    );

  return response.data.data.favorite;
}

export async function removeFromFavorites(
  tmdbId: number,
): Promise<string> {
  const response =
    await api.delete<RemoveFavoriteResponse>(
      `/favorites/${tmdbId}`,
    );

  return response.data.data.message;
}

export async function getFavoriteStatus(
  tmdbId: number,
): Promise<boolean> {
  const response =
    await api.get<FavoriteStatusResponse>(
      `/favorites/${tmdbId}/status`,
    );

  return response.data.data.isFavorite;
}