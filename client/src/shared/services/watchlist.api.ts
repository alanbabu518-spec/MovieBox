import api from "./api";

export interface WatchlistMovie {
  id: string;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  movieId: string;
  createdAt: string;
  movie: WatchlistMovie;
}

interface WatchlistResponse {
  success: boolean;
  data: {
    watchlist: WatchlistItem[];
  };
}

interface WatchlistItemResponse {
  success: boolean;
  data: {
    watchlist: WatchlistItem;
  };
}

interface WatchlistStatusResponse {
  success: boolean;
  data: {
    isInWatchlist: boolean;
  };
}

interface RemoveWatchlistResponse {
  success: boolean;
  data: {
    message: string;
  };
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const response =
    await api.get<WatchlistResponse>("/watchlist");

  return response.data.data.watchlist;
}

export async function addToWatchlist(
  tmdbId: number,
): Promise<WatchlistItem> {
  const response =
    await api.post<WatchlistItemResponse>(
      "/watchlist",
      { tmdbId },
    );

  return response.data.data.watchlist;
}

export async function removeFromWatchlist(
  tmdbId: number,
): Promise<string> {
  const response =
    await api.delete<RemoveWatchlistResponse>(
      `/watchlist/${tmdbId}`,
    );

  return response.data.data.message;
}

export async function getWatchlistStatus(
  tmdbId: number,
): Promise<boolean> {
  const response =
    await api.get<WatchlistStatusResponse>(
      `/watchlist/${tmdbId}/status`,
    );

  return response.data.data.isInWatchlist;
}