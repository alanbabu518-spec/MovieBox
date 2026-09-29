import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Heart,
  Play,
  Plus,
  Star,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../shared/components/layout/Navbar";
import MovieCard from "../shared/components/movie/MovieCard";
import {
  getMovieDetails,
  type MovieDetails as MovieDetailsType,
} from "../shared/services/movie.api";
import type { Movie } from "../shared/types/movie";

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] =
    useState<MovieDetailsType | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadMovie = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMovieDetails(id);

        setMovie(data);
      } catch (error) {
        console.error(
          "Failed to load movie:",
          error
        );

        setError(
          "Unable to load movie details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [id]);

  if (loading) {
    return (
      <div
        className="min-h-screen"
        style={{
          backgroundColor: "var(--background)",
        }}
      >
        <Navbar />

        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="aspect-video w-full animate-pulse rounded-xl bg-[var(--card)]" />
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div
        className="min-h-screen"
        style={{
          backgroundColor: "var(--background)",
          color: "var(--text-primary)",
        }}
      >
        <Navbar />

        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6">
          <div className="text-center">
            <p
              className="text-lg font-semibold"
              style={{
                color: "var(--text-primary)",
              }}
            >
              {error || "Movie not found"}
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-5 rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
              style={{
                backgroundColor:
                  "var(--primary)",
              }}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const director = movie.credits.crew.find(
    (person) => person.job === "Director"
  );

  const trailer = movie.videos.results.find(
    (video) =>
      video.site === "YouTube" &&
      video.type === "Trailer"
  );

  const releaseYear = movie.release_date
    ? new Date(
        movie.release_date
      ).getFullYear()
    : null;

  const similarMovies: Movie[] =
    movie.similar.results
      .filter((item) => item.poster_path)
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        title: item.title,
        posterUrl: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
        backdropUrl:
          item.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
            : undefined,
        releaseDate: item.release_date,
        rating: item.vote_average,
        overview: item.overview,
      }));

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--text-primary)",
      }}
    >
      <Navbar />

      <main>
        <section className="relative overflow-hidden">
          {movie.backdrop_path && (
            <div className="absolute inset-0 h-155">
              <img
                src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
                alt=""
                className="h-full w-full object-cover"
              />

              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(10,10,10,0.45) 45%, var(--background) 100%)",
                }}
              />
            </div>
          )}

          <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-8 lg:pt-12">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-8 flex items-center gap-2 text-sm font-medium"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              <ArrowLeft size={17} />
              Back
            </button>

            <div className="flex min-h-125 items-end">
              <div className="grid w-full grid-cols-1 items-end gap-8 md:grid-cols-[220px_1fr] lg:grid-cols-[250px_1fr]">
                <div className="hidden md:block">
                  {movie.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full rounded-xl shadow-2xl"
                    />
                  )}
                </div>

                <div className="max-w-3xl pb-4">
                  <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
                    <span
                      style={{
                        color: "var(--primary)",
                      }}
                    >
                      MovieBox
                    </span>
                  </div>

                  <h1
                    className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
                    style={{
                      color: "#ffffff",
                    }}
                  >
                    {movie.title}
                  </h1>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/70">
                    {releaseYear && (
                      <span>{releaseYear}</span>
                    )}

                    {director && (
                      <>
                        <span>•</span>
                        <span>
                          Directed by{" "}
                          <strong className="text-white">
                            {director.name}
                          </strong>
                        </span>
                      </>
                    )}

                    {movie.runtime && (
                      <>
                        <span>•</span>
                        <span>
                          {movie.runtime} mins
                        </span>
                      </>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded-md bg-black/60 px-3 py-2 backdrop-blur-md">
                      <Star
                        size={15}
                        fill="currentColor"
                        style={{
                          color:
                            "var(--primary)",
                        }}
                      />

                      <span className="text-sm font-semibold text-white">
                        {movie.vote_average.toFixed(
                          1
                        )}
                      </span>
                    </div>

                    {trailer && (
                      <a
                        href={`https://www.youtube.com/watch?v=${trailer.key}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
                        style={{
                          backgroundColor:
                            "var(--primary)",
                        }}
                      >
                        <Play
                          size={15}
                          fill="currentColor"
                        />
                        Trailer
                      </a>
                    )}

                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-lg border border-white/15 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md"
                    >
                      <Plus size={16} />
                      Watchlist
                    </button>

                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-black/50 text-white backdrop-blur-md"
                    >
                      <Heart size={17} />
                    </button>
                  </div>

                  {movie.genres.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {movie.genres.map(
                        (genre) => (
                          <span
                            key={genre.id}
                            className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-white/80 backdrop-blur-md"
                          >
                            {genre.name}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
          {movie.tagline && (
            <p
              className="max-w-4xl text-sm font-medium uppercase tracking-[0.18em] sm:text-base"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {movie.tagline}
            </p>
          )}

          <div className="mt-10 max-w-4xl">
            <h2
              className="font-display text-2xl font-bold sm:text-3xl"
              style={{
                color: "var(--text-primary)",
              }}
            >
              Overview
            </h2>

            <p
              className="mt-5 text-base leading-8"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {movie.overview}
            </p>
          </div>

          <section className="mt-16">
            <div className="mb-7">
              <p
                className="mb-2 text-xs font-semibold uppercase tracking-[0.25em]"
                style={{
                  color: "var(--primary)",
                }}
              >
                MovieBox
              </p>

              <h2
                className="font-display text-3xl font-bold"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                Cast & Crew
              </h2>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-4">
              {movie.credits.cast
                .slice(0, 8)
                .map((person) => (
                  <div
                    key={person.id}
                    className="w-28 flex-none sm:w-32"
                  >
                    <div className="aspect-3/4 overflow-hidden rounded-lg">
                      {person.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w300${person.profile_path}`}
                          alt={person.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-full items-center justify-center"
                          style={{
                            backgroundColor:
                              "var(--card)",
                          }}
                        >
                          <span
                            className="text-xs"
                            style={{
                              color:
                                "var(--text-secondary)",
                            }}
                          >
                            No Image
                          </span>
                        </div>
                      )}
                    </div>

                    <p
                      className="mt-3 truncate text-sm font-semibold"
                      style={{
                        color:
                          "var(--text-primary)",
                      }}
                    >
                      {person.name}
                    </p>

                    <p
                      className="mt-1 truncate text-xs"
                      style={{
                        color:
                          "var(--text-secondary)",
                      }}
                    >
                      {person.character}
                    </p>
                  </div>
                ))}
            </div>
          </section>

          {trailer && (
            <section className="mt-16">
              <div className="mb-7">
                <p
                  className="mb-2 text-xs font-semibold uppercase tracking-[0.25em]"
                  style={{
                    color: "var(--primary)",
                  }}
                >
                  MovieBox
                </p>

                <h2
                  className="font-display text-3xl font-bold"
                  style={{
                    color: "var(--text-primary)",
                  }}
                >
                  Trailer
                </h2>
              </div>

              <div className="aspect-video w-full max-w-5xl overflow-hidden rounded-xl">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title={trailer.name}
                  className="h-full w-full"
                  allowFullScreen
                />
              </div>
            </section>
          )}

          {similarMovies.length > 0 && (
            <section className="mt-20">
              <div className="mb-8">
                <p
                  className="mb-2 text-xs font-semibold uppercase tracking-[0.25em]"
                  style={{
                    color: "var(--primary)",
                  }}
                >
                  MovieBox
                </p>

                <h2
                  className="font-display text-3xl font-bold"
                  style={{
                    color: "var(--text-primary)",
                  }}
                >
                  Similar Movies
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 sm:gap-x-7 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {similarMovies.map(
                  (similarMovie) => (
                    <MovieCard
                      key={similarMovie.id}
                      movie={similarMovie}
                    />
                  )
                )}
              </div>
            </section>
          )}
        </section>
      </main>
    </div>
  );
}