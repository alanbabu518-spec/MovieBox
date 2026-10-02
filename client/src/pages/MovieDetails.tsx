import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../shared/components/layout/Navbar";
import MovieDetailsHero from "../shared/components/moviedetails/MovieDetailsHero";
import MovieOverview from "../shared/components/moviedetails/MovieOverview";
import MovieCast from "../shared/components/moviedetails/MovieCast";
import MovieCrew from "../shared/components/moviedetails/MovieCrew";
import MovieTrailer from "../shared/components/moviedetails/MovieTrailer";
import SimilarMovies from "../shared/components/moviedetails/SimilarMovies";
import WhereToWatch from "../shared/components/moviedetails/WhereToWatch";
import RecommendedMovies from "../shared/components/moviedetails/RecommendedMovies";
import MovieRating from "../shared/components/moviedetails/MovieRating";
import MovieReviews from "../shared/components/moviedetails/MovieReviews";
import AddReview from "../shared/components/moviedetails/AddReview";
import WatchlistButton from "../shared/components/movie/WatchlistButton";
import FavoriteButton from "../shared/components/movie/FavoriteButton";
import AIRecommendations from "../shared/components/movie/AIRecommendations";

import {
  getMovieDetails,
  getWatchProviders,
  type MovieDetails as MovieDetailsType,
  type WatchProviders,
} from "../shared/services/movie.api";

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<MovieDetailsType | null>(null);

  const [providers, setProviders] = useState<WatchProviders | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Movie ID is missing.");
      setLoading(false);
      return;
    }

    const loadMovie = async () => {
      try {
        setLoading(true);
        setError("");

        const [movieData, providerData] = await Promise.all([
          getMovieDetails(id),
          getWatchProviders(id).catch(() => null),
        ]);

        setMovie(movieData);
        setProviders(providerData);
      } catch (error) {
        console.error("Failed to load movie:", error);

        setError("Unable to load movie details.");
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
          <div className="h-12 w-32 animate-pulse rounded-md bg-(--card)]" />

          <div className="mt-8 grid gap-8 md:grid-cols-[220px_1fr] lg:grid-cols-[250px_1fr]">
            <div className="aspect-2/3 animate-pulse rounded-xl bg-(--card)]" />

            <div className="flex flex-col justify-end">
              <div className="h-10 w-3/4 animate-pulse rounded-md bg-(--card)]" />

              <div className="mt-5 h-5 w-1/2 animate-pulse rounded-md bg-(--card)]" />

              <div className="mt-5 h-10 w-40 animate-pulse rounded-md bg-(--card)]" />
            </div>
          </div>
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
                backgroundColor: "var(--primary)",
              }}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const credits = movie.credits ?? {
    cast: [],
    crew: [],
  };

  const videos = movie.videos ?? {
    results: [],
  };

  const similar = movie.similar ?? {
    results: [],
  };

  const director = credits.crew.find((person) => person.job === "Director");

  const trailer = videos.results.find(
    (video) => video.site === "YouTube" && video.type === "Trailer",
  );

  const movieWithCredits = {
    ...movie,
    credits,
  };

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
        <MovieDetailsHero
          movie={movie}
          director={director}
          trailer={trailer}
          onBack={() => navigate(-1)}
        />

        <div className="mx-auto flex max-w-7xl justify-end gap-3 px-6 pt-6 lg:px-8">
          <WatchlistButton tmdbId={Number(movie.id)} variant="button" />

          <FavoriteButton tmdbId={Number(movie.id)} variant="button" />
        </div>

        <MovieOverview movie={movie} />

        <MovieCast movie={movieWithCredits} />

        <MovieCrew movie={movieWithCredits} />

        <MovieTrailer trailer={trailer} />

        <SimilarMovies movies={similar.results} />

        <RecommendedMovies />

        <AIRecommendations />

        <WhereToWatch providers={providers} />

        <MovieRating tmdbId={String(movie.id)} />

        <MovieReviews tmdbId={String(movie.id)} />

        <AddReview
          tmdbId={String(movie.id)}
          onReviewCreated={() => {
            window.location.reload();
          }}
        />
      </main>
    </div>
  );
}
