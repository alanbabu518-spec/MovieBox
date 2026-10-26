import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../shared/components/layout/Navbar";
import Footer from "../shared/components/layout/Footer";
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
import SectionHeader from "../shared/components/ui/Sectionheader";
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

import { formatRuntime } from "../shared/lib/Format";
import { cn } from "../shared/lib/cn";

type ExtraFields = {
  status?: string;
  original_language?: string;
  budget?: number;
  revenue?: number;
};

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "cast", label: "Cast & Crew" },
  { id: "reviews", label: "Reviews" },
  { id: "similar", label: "Similar" },
] as const;

const money = (value?: number) =>
  value
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value)
    : null;

const names = (list: { name: string }[], count = 3) =>
  Array.from(new Set(list.map((person) => person.name)))
    .slice(0, count)
    .join(", ") || null;

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [providers, setProviders] = useState<WatchProviders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewsVersion, setReviewsVersion] = useState(0);
  const [active, setActive] = useState<string>("overview");

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
    void loadMovie();
  }, [loadMovie]);

  /* Highlight the tab of the section currently in view */
  useEffect(() => {
    if (!movie) {
      return;
    }

    const nodes = SECTIONS.map((section) =>
      document.getElementById(section.id),
    ).filter((node): node is HTMLElement => node !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActive(visible.target.id);
        }
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [movie]);

  if (loading) {
    return (
      <div className="min-h-screen overflow-x-hidden">
        <Navbar />
        <MovieDetailsSkeleton />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen overflow-x-hidden">
        <Navbar />
        <MovieDetailsError
          message={error || "We couldn’t find this movie."}
          onRetry={() => void loadMovie()}
          onBack={() => navigate(-1)}
        />
      </div>
    );
  }

  const credits = movie.credits ?? { cast: [], crew: [] };
  const videos = movie.videos ?? { results: [] };
  const similar = movie.similar ?? { results: [] };
  const extra = movie as MovieDetailsType & ExtraFields;

  const director = credits.crew.find((person) => person.job === "Director");

  const trailer = videos.results.find(
    (video) => video.site === "YouTube" && video.type === "Trailer",
  );

  const movieWithCredits = { ...movie, credits };

  const language = extra.original_language
    ? (new Intl.DisplayNames(["en"], { type: "language" }).of(
        extra.original_language,
      ) ?? extra.original_language)
    : null;

  const facts = [
    {
      label: "Director",
      value: names(credits.crew.filter((p) => p.job === "Director"), 2),
    },
    {
      label: "Writers",
      value: names(
        credits.crew.filter(
          (p) =>
            p.department === "Writing" ||
            p.job === "Writer" ||
            p.job === "Screenplay",
        ),
      ),
    },
    { label: "Stars", value: names(credits.cast, 4) },
    {
      label: "Release date",
      value: movie.release_date
        ? new Date(movie.release_date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : null,
    },
    { label: "Runtime", value: formatRuntime(movie.runtime) },
    {
      label: "Genres",
      value: movie.genres.map((genre) => genre.name).join(", ") || null,
    },
    { label: "Language", value: language },
    { label: "Status", value: extra.status ?? null },
    { label: "Budget", value: money(extra.budget) },
    { label: "Revenue", value: money(extra.revenue) },
  ].filter((fact) => fact.value);

  const goTo = (sectionId: string) =>
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar overlay />

      <main>
        <MovieDetailsHero
          movie={movie}
          director={director}
          trailer={trailer}
          onBack={() => navigate(-1)}
        />

        {/* Section tabs */}
        <nav
          aria-label="Movie sections"
          className="sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-40 border-b border-line bg-canvas/90 backdrop-blur-xl"
        >
          <div className="scrollbar-none mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                aria-current={active === section.id ? "true" : undefined}
                onClick={() => goTo(section.id)}
                className={cn(
                  "relative shrink-0 px-4 py-3.5 text-sm font-semibold transition-colors duration-150",
                  active === section.id ? "text-ink" : "text-muted",
                )}
              >
                {section.label}

                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-3 bottom-0 h-0.5 origin-left rounded-full bg-brand transition-transform duration-300 ease-out",
                    active === section.id ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </button>
            ))}
          </div>
        </nav>

        {/* Overview */}
        <div id="overview" className="scroll-mt-28">
          <section className="mx-auto grid max-w-[1400px] gap-8 px-4 pb-12 pt-8 sm:px-6 lg:grid-cols-2 lg:px-8">
            {facts.length > 0 && (
              <div>
                <SectionHeader title="Details" />

                <dl className="divide-y divide-line rounded-2xl border border-line bg-card px-4">
                  {facts.map((fact) => (
                    <div
                      key={fact.label}
                      className="grid grid-cols-[110px_1fr] gap-3 py-3 text-sm sm:grid-cols-[140px_1fr]"
                    >
                      <dt className="text-muted">{fact.label}</dt>
                      <dd className="font-medium">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {trailer && (
              <div>
                <SectionHeader title="Trailer" />
                <MovieTrailer trailer={trailer} />
              </div>
            )}
          </section>

          <WhereToWatch providers={providers} />
        </div>

        {/* Cast & crew */}
        <div id="cast" className="scroll-mt-28">
          <MovieCast movie={movieWithCredits} />
          <MovieCrew movie={movieWithCredits} />
        </div>

        {/* Reviews */}
        <div id="reviews" className="scroll-mt-28">
          <MovieRating key={`rating-${reviewsVersion}`} tmdbId={String(movie.id)} />
          <MovieReviews key={`reviews-${reviewsVersion}`} tmdbId={String(movie.id)} />
          <AddReview
            tmdbId={String(movie.id)}
            onReviewCreated={() => setReviewsVersion((value) => value + 1)}
          />
        </div>

        {/* Similar */}
        <div id="similar" className="scroll-mt-28">
          <SimilarMovies movies={similar.results} />
          <AIRecommendations />
        </div>
      </main>

      <Footer />
    </div>
  );
}