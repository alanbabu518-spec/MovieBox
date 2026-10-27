import { create } from "zustand";

import {
  addToFavorites,
  getFavorites,
  removeFromFavorites,
} from "../shared/services/favorites.api";

import {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
} from "../shared/services/watchlist.api";

export type LibraryKind = "favorites" | "watchlist";

interface LibraryState {
  favorites: Set<number>;
  watchlist: Set<number>;

  load: () => Promise<void>;

  reset: () => void;

  /**
   * Updates library membership locally.
   * Useful when another operation has already updated the backend.
   */
  mark: (
    kind: LibraryKind,
    tmdbId: number,
    on: boolean,
  ) => void;

  /**
   * Optimistically updates the library and calls the API.
   * Rolls back the change if the API request fails.
   *
   * Returns true when the request succeeds and false when it fails.
   */
  toggle: (
    kind: LibraryKind,
    tmdbId: number,
  ) => Promise<boolean>;
}

const endpoints = {
  favorites: {
    add: addToFavorites,
    remove: removeFromFavorites,
  },
  watchlist: {
    add: addToWatchlist,
    remove: removeFromWatchlist,
  },
} as const;

export const useLibraryStore = create<LibraryState>(
  (set, get) => ({
    favorites: new Set<number>(),
    watchlist: new Set<number>(),

    /**
     * Fetches favorites and watchlist concurrently.
     *
     * Promise.allSettled allows one request to succeed even when
     * the other request fails.
     */
    load: async () => {
      const [favoritesResult, watchlistResult] =
        await Promise.allSettled([
          getFavorites(),
          getWatchlist(),
        ]);

      set((state) => ({
        favorites:
          favoritesResult.status === "fulfilled"
            ? new Set(
                favoritesResult.value.map(
                  (item) => item.movie.tmdbId,
                ),
              )
            : state.favorites,

        watchlist:
          watchlistResult.status === "fulfilled"
            ? new Set(
                watchlistResult.value.map(
                  (item) => item.movie.tmdbId,
                ),
              )
            : state.watchlist,
      }));

      if (favoritesResult.status === "rejected") {
        console.error(
          "Failed to load favorites:",
          favoritesResult.reason,
        );
      }

      if (watchlistResult.status === "rejected") {
        console.error(
          "Failed to load watchlist:",
          watchlistResult.reason,
        );
      }
    },

    /**
     * Clears user-specific library state.
     */
    reset: () => {
      set({
        favorites: new Set<number>(),
        watchlist: new Set<number>(),
      });
    },

    /**
     * Adds or removes a movie from the local Set.
     * A new Set is created to preserve immutable state updates.
     */
    mark: (kind, tmdbId, on) => {
      set((state) => {
        const next = new Set(state[kind]);

        if (on) {
          next.add(tmdbId);
        } else {
          next.delete(tmdbId);
        }

        if (kind === "favorites") {
          return { favorites: next };
        }

        return { watchlist: next };
      });
    },

    /**
     * Optimistic update:
     *
     * 1. Update the UI immediately.
     * 2. Send the corresponding API request.
     * 3. If it fails, restore the previous membership state.
     */
    toggle: async (kind, tmdbId) => {
      const wasInLibrary = get()[kind].has(tmdbId);

      // Update the UI immediately.
      get().mark(kind, tmdbId, !wasInLibrary);

      try {
        if (wasInLibrary) {
          await endpoints[kind].remove(tmdbId);
        } else {
          await endpoints[kind].add(tmdbId);
        }

        return true;
      } catch (error) {
        // Restore the previous state if the request fails.
        get().mark(kind, tmdbId, wasInLibrary);

        console.error(
          `Failed to update ${kind} for movie ${tmdbId}:`,
          error,
        );

        return false;
      }
    },
  }),
);