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
  /** update membership locally only (e.g. after a page removed an item itself) */
  mark: (kind: LibraryKind, tmdbId: number, on: boolean) => void;
  /** optimistic toggle + API call, rolls back on failure */
  toggle: (kind: LibraryKind, tmdbId: number) => Promise<void>;
}

const endpoints = {
  favorites: { add: addToFavorites, remove: removeFromFavorites },
  watchlist: { add: addToWatchlist, remove: removeFromWatchlist },
} as const;

export const useLibraryStore = create<LibraryState>((set, get) => ({
  favorites: new Set<number>(),
  watchlist: new Set<number>(),

  load: async () => {
    const [favorites, watchlist] = await Promise.allSettled([
      getFavorites(),
      getWatchlist(),
    ]);

    set({
      favorites:
        favorites.status === "fulfilled"
          ? new Set(favorites.value.map((item) => item.movie.tmdbId))
          : get().favorites,
      watchlist:
        watchlist.status === "fulfilled"
          ? new Set(watchlist.value.map((item) => item.movie.tmdbId))
          : get().watchlist,
    });
  },

  reset: () =>
    set({ favorites: new Set<number>(), watchlist: new Set<number>() }),

  mark: (kind, tmdbId, on) =>
    set((state) => {
      const next = new Set(state[kind]);

      if (on) {
        next.add(tmdbId);
      } else {
        next.delete(tmdbId);
      }

      return kind === "favorites"
        ? { favorites: next }
        : { watchlist: next };
    }),

  toggle: async (kind, tmdbId) => {
    const had = get()[kind].has(tmdbId);

    get().mark(kind, tmdbId, !had);

    try {
      if (had) {
        await endpoints[kind].remove(tmdbId);
      } else {
        await endpoints[kind].add(tmdbId);
      }
    } catch {
      get().mark(kind, tmdbId, had);
    }
  },
}));