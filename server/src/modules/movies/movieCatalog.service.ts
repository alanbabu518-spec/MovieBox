import { randomUUID } from "node:crypto";

import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../config/database.js";
import { redis } from "../../config/redis.js";
import { addMovieTitles } from "./autocomplete.service.js";
import { discoverMovies } from "../../integrations/tmdb/tmdb.service.js";

const LOCK_KEY = "moviebox:catalog-ingestion:lock";
const LOCK_TTL_SECONDS = 300;
const LOCK_RENEW_INTERVAL_MS = 60_000;

type CatalogMovie = {
  id: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
};

const toMovieData = (movie: CatalogMovie) => ({
  tmdbId: movie.id,
  title: movie.title,
  posterPath: movie.posterPath,
  backdropPath: movie.backdropPath,
  releaseDate: movie.releaseDate ? new Date(movie.releaseDate) : null,
});

const updateMoviesInBulk = async (movies: CatalogMovie[]) => {
  if (movies.length === 0) {
    return;
  }

  const values = movies.map((movie) => ({
    tmdb_id: movie.id,
    title: movie.title,
    poster_path: movie.posterPath,
    backdrop_path: movie.backdropPath,
    release_date: movie.releaseDate
      ? new Date(movie.releaseDate).toISOString()
      : null,
  }));

  await prisma.$executeRaw`
    UPDATE "Movie" AS target
    SET
      "title" = source.title,
      "posterPath" = source.poster_path,
      "backdropPath" = source.backdrop_path,
      "releaseDate" = source.release_date::timestamp(3),
      "updatedAt" = CURRENT_TIMESTAMP
    FROM jsonb_to_recordset(${JSON.stringify(values)}::jsonb)
      AS source(
        tmdb_id integer,
        title text,
        poster_path text,
        backdrop_path text,
        release_date text
      )
    WHERE target."tmdbId" = source.tmdb_id
  `;
};

export const ingestMovieCatalog = async (pages = 5) => {
  if (!Number.isInteger(pages) || pages < 1 || pages > 500) {
    throw new Error("Pages must be an integer between 1 and 500");
  }

  const lockToken = randomUUID();

  const lockAcquired = await redis.set(
    LOCK_KEY,
    lockToken,
    "EX",
    LOCK_TTL_SECONDS,
    "NX",
  );

  if (lockAcquired !== "OK") {
    throw new Error("Catalog ingestion is already running");
  }

  let lockLost = false;
  let renewalInProgress = false;

  const renewLock = setInterval(async () => {
    if (renewalInProgress || lockLost) {
      return;
    }

    renewalInProgress = true;

    try {
      const result = await redis.eval(
        `
          if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("EXPIRE", KEYS[1], ARGV[2])
          end
          return 0
        `,
        1,
        LOCK_KEY,
        lockToken,
        LOCK_TTL_SECONDS.toString(),
      );

      if (result !== 1) {
        lockLost = true;
      }
    } catch {
      lockLost = true;
    } finally {
      renewalInProgress = false;
    }
  }, LOCK_RENEW_INTERVAL_MS);

  renewLock.unref();

  let totalMovies = 0;
  const titles = new Set<string>();

  try {
    for (let page = 1; page <= pages; page += 1) {
      if (lockLost) {
        throw new Error("Catalog ingestion lock was lost");
      }

      const result = await discoverMovies({ page });

      if (lockLost) {
        throw new Error("Catalog ingestion lock was lost");
      }

      // Deduplicate movies by TMDB ID.
      const moviesByTmdbId = new Map<number, CatalogMovie>();

      for (const movie of result.movies as CatalogMovie[]) {
        moviesByTmdbId.set(movie.id, movie);
      }

      const movies = [...moviesByTmdbId.values()];

      if (movies.length === 0) {
        continue;
      }

      const existingMovies = await prisma.movie.findMany({
        where: {
          tmdbId: {
            in: movies.map((movie) => movie.id),
          },
        },
        select: {
          tmdbId: true,
        },
      });

      if (lockLost) {
        throw new Error("Catalog ingestion lock was lost");
      }

      const existingIds = new Set(existingMovies.map((movie) => movie.tmdbId));

      const newMovies = movies.filter((movie) => !existingIds.has(movie.id));

      const moviesToUpdate = movies.filter((movie) =>
        existingIds.has(movie.id),
      );

      // Insert new movies in one database operation.
      if (newMovies.length > 0) {
        await prisma.movie.createMany({
          data: newMovies.map(toMovieData),
          skipDuplicates: true,
        });
      }

      if (lockLost) {
        throw new Error("Catalog ingestion lock was lost");
      }

      // Update existing movies in one parameterized SQL statement.
      if (moviesToUpdate.length > 0) {
        if (lockLost) {
          throw new Error("Catalog ingestion lock was lost");
        }

        await updateMoviesInBulk(moviesToUpdate);
      }

      for (const movie of movies) {
        titles.add(movie.title);
      }

      totalMovies += movies.length;
    }

    if (lockLost) {
      throw new Error("Catalog ingestion lock was lost");
    }

    if (titles.size > 0) {
      await addMovieTitles([...titles]);
    }

    return {
      pages,
      totalMovies,
      uniqueTitles: titles.size,
    };
  } finally {
    clearInterval(renewLock);

    try {
      await redis.eval(
        `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
          return redis.call("DEL", KEYS[1])
        end
        return 0
      `,
        1,
        LOCK_KEY,
        lockToken,
      );
    } catch (error) {
      console.error("Failed to release catalog ingestion lock:", error);
    }
  }
};
