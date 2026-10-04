import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../shared/components/layout/Navbar";
import MovieDetailsHero from "../shared/components/moviedetails/MovieDetailsHero";
import MovieCast from "../shared/components/moviedetails/MovieCast";
import MovieCrew from "../shared/components/moviedetails/MovieCrew";
import MovieTrailer from "../shared/components/moviedetails/MovieTrailer";
import SimilarMovies from "../shared/components/moviedetails/SimilarMovies";
import WhereToWatch from "../shared/components/moviedetails/WhereToWatch";
import MovieRating from "../shared/components/moviedetails/MovieRating";
import MovieReviews from "../shared/components/moviedetails/MovieReviews";
import AddReview from "../shared/components/moviedetails/AddReview";
import AIRecommendations from "../shared/components/movie/AIRecommendations";
import {
  MovieDetailsError,
  MovieDetailsSkeleton,
} from "../shared/components/moviedetails/Moviedetailsstates";

import {
  getMovieDetails,
  getWatchProviders,
  type MovieDetails as MovieDetailsType,
  type WatchProviders,
} from "../shared/services/movie.api";

type ExtraFields = {
  status?: string;
  original_language?: string;
  budget?: number;
  revenue?: number;
};

const money = (value?: number) =>
  value
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value)
    : null;

function Facts({ movie }: { movie: MovieDetailsType & ExtraFields }) {
  const language = movie.original_language
    ? (new Intl.DisplayNames(["en"], { type: "language" }).of(movie.original_language) ??
      movie.original_language)
    : null;

  const items = [
    { label: "Release date", value: movie.release_date
        ? new Date(movie.release_date).toLocaleDateString(undefined, {
            year: "numeric", month: "long", day: "numeric",
          })
        : null },
    { label: "Status", value: movie.status },
    { label: "Language", value: language },
    { label: "Budget", value: money(movie.budget) },
    { label: "Revenue", value: money(movie.revenue) },
  ].filter((item) => item.value);

  if (items.length === 0) return null;

  return (
    <dl
      className="grid grid-cols-2 gap-x-6 gap-y-5 rounded-xl border p-5 sm:grid-cols-3 lg:grid-cols-5"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
    >
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {item.label}
          </dt>
          <dd className="mt-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [providers, setProviders] = useState<WatchProviders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewsVersion, setReviewsVersion] = useState(0);

  const loadMovie = useCallback(async () => {
    if (!id) {
      setError("Movie ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [movieData, providerData] = await Promise.all([
        getMovieDetails(id),
        getWatchProviders(id).catch(() => null),
      ]);

      setMovie(movieData);
      setProviders(providerData);
    } catch (err) {
      console.error("Failed to load movie:", err);
      setError("Something went wrong while fetching the details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    loadMovie();
  }, [loadMovie]);

  const shell = (children: React.ReactNode) => (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "var(--background)", color: "var(--text-primary)" }}
    >
      <Navbar />
      {children}
    </div>
  );

  if (loading) return shell(<MovieDetailsSkeleton />);

  if (error || !movie) {
    return shell(
      <MovieDetailsError
        message={error || "We couldn't find this movie."}
        onRetry={loadMovie}
        onBack={() => navigate(-1)}
      />,
    );
  }

  const credits = movie.credits ?? { cast: [], crew: [] };
  const videos = movie.videos ?? { results: [] };
  const similar = movie.similar ?? { results: [] };

  const director = credits.crew.find((p) => p.job === "Director");
  const trailer = videos.results.find(
    (v) => v.site === "YouTube" && v.type === "Trailer",
  );
  const movieWithCredits = { ...movie, credits };

  return shell(
    <main>
      <MovieDetailsHero
        movie={movie}
        director={director}
        trailer={trailer}
        onBack={() => navigate(-1)}
      />

      <div className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <Facts movie={movie as MovieDetailsType & ExtraFields} />
      </div>

      <MovieCast movie={movieWithCredits} />
      <MovieCrew movie={movieWithCredits} />

      <div id="trailer" className="scroll-mt-6">
        <MovieTrailer trailer={trailer} />
      </div>

      <WhereToWatch providers={providers} />

      <MovieRating key={`rating-${reviewsVersion}`} tmdbId={String(movie.id)} />
      <MovieReviews key={`reviews-${reviewsVersion}`} tmdbId={String(movie.id)} />
      <AddReview
        tmdbId={String(movie.id)}
        onReviewCreated={() => setReviewsVersion((v) => v + 1)}
      />

      <SimilarMovies movies={similar.results} />
      <AIRecommendations />
    </main>,
  );
}