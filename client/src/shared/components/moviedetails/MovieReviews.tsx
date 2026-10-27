import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star, UserRound } from "lucide-react";
import {
  getReviews,
  getTMDBReviews,
  type Review,
  type TMDBReview,
} from "../../services/movie.api";

interface CombinedMovieReviewsProps {
  tmdbId: string;
}

type CombinedReview = {
  id: string;
  source: "MovieBox" | "TMDB";
  author: string;
  avatarPath: string | null;
  content: string;
  rating: number | null;
  createdAt: string;
};

const formatDate = (value: string) => {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

const getAvatarUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/https://")) {
    return path.slice(1);
  }

  return `https://image.tmdb.org/t/p/w185${path}`;
};

const normalizeTMDBReview = (review: TMDBReview): CombinedReview => ({
  id: `tmdb-${review.id}`,
  source: "TMDB",
  author:
    review.author_details?.name?.trim() ||
    review.author ||
    review.author_details?.username ||
    "TMDB user",
  avatarPath: review.author_details?.avatar_path ?? null,
  content: review.content,
  rating:
    typeof review.author_details?.rating === "number"
      ? review.author_details.rating
      : null,
  createdAt: review.created_at,
});

const normalizeMovieBoxReview = (review: Review): CombinedReview => ({
  id: `moviebox-${review.id}`,
  source: "MovieBox",
  author: review.user?.name || "MovieBox user",
  avatarPath: null,
  content: review.content,
  rating:
    review.rating == null || !Number.isFinite(Number(review.rating))
      ? null
      : Number(review.rating),
  createdAt: review.createdAt,
});

export default function CombinedMovieReviews({
  tmdbId,
}: CombinedMovieReviewsProps) {
  const [reviews, setReviews] = useState<CombinedReview[]>([]);
  // Keep the latest reviews available to loadPage without making it depend on state.
  // This prevents loadPage -> useEffect -> loadPage request loops.
  const reviewsRef = useRef<CombinedReview[]>([]);
  const requestInFlightRef = useRef(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(
    () => new Set(),
  );

  const loadPage = useCallback(
    async (targetPage: number, append: boolean) => {
      // Prevent overlapping page loads from navigation clicks or React re-renders.
      if (requestInFlightRef.current) return;
      requestInFlightRef.current = true;

      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        setError("");

        // Load MovieBox community reviews and the requested TMDB page independently.
        const [communityResult, tmdbResult] = await Promise.allSettled([
          getReviews(tmdbId),
          getTMDBReviews(tmdbId, targetPage),
        ]);

        if (
          communityResult.status === "rejected" &&
          tmdbResult.status === "rejected"
        ) {
          throw communityResult.reason;
        }

        const communityReviews =
          communityResult.status === "fulfilled"
            ? communityResult.value.map(normalizeMovieBoxReview)
            : [];
        const tmdbReviews =
          tmdbResult.status === "fulfilled"
            ? tmdbResult.value.results.map(normalizeTMDBReview)
            : [];

        const currentTMDBReviews = append
          ? reviewsRef.current.filter((review) => review.source === "TMDB")
          : [];
        const uniqueTMDBReviews = [
          ...currentTMDBReviews,
          ...tmdbReviews.filter(
            (review) =>
              !currentTMDBReviews.some((item) => item.id === review.id),
          ),
        ];

        const combined = [...communityReviews, ...uniqueTMDBReviews].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        reviewsRef.current = combined;
        setReviews(combined);

        if (tmdbResult.status === "fulfilled") {
          setPage(tmdbResult.value.page);
          setTotalPages(tmdbResult.value.total_pages);
        } else if (!append) {
          setPage(1);
          setTotalPages(1);
        }

        if (!append) setActiveIndex(0);

        if (
          communityResult.status === "rejected" ||
          tmdbResult.status === "rejected"
        ) {
          console.warn("One review source could not be loaded.");
          if (combined.length === 0) {
            setError("Reviews couldn't be loaded. Please try again.");
          }
        }
      } catch (err) {
        console.error("Failed to load combined reviews:", err);
        setError("Reviews couldn't be loaded. Please try again.");
      } finally {
        requestInFlightRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [tmdbId],
  );

  useEffect(() => {
    reviewsRef.current = [];
    setReviews([]);
    setPage(1);
    setTotalPages(1);
    setActiveIndex(0);
    setExpandedReviews(new Set());
    void loadPage(1, false);
  }, [loadPage]);

  const activeReview = reviews[activeIndex];

  const moveTo = (nextIndex: number) => {
    if (nextIndex < 0) return;

    if (nextIndex < reviews.length) {
      setActiveIndex(nextIndex);
      return;
    }

    if (page < totalPages && !loadingMore) {
      void loadPage(page + 1, true).then(() => {
        setActiveIndex(nextIndex);
      });
    }
  };

  const toggleExpanded = (reviewId: string) => {
    setExpandedReviews((current) => {
      const next = new Set(current);
      if (next.has(reviewId)) next.delete(reviewId);
      else next.add(reviewId);
      return next;
    });
  };

  const activeExpanded = activeReview
    ? expandedReviews.has(activeReview.id)
    : false;
  const activeLongReview = (activeReview?.content.length ?? 0) > 850;
  const canGoBack = activeIndex > 0;
  const canGoForward = activeIndex < reviews.length - 1 || page < totalPages;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div
        className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b pb-6"
        style={{ borderColor: "var(--border)" }}
      >
        <div>
          <p
            className="mb-2 text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color: "#F5C518" }}
          >
            Community voices
          </p>

          <h2
            className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            Audience Reviews
          </h2>

          {!loading && reviews.length > 0 && (
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {reviews.length.toLocaleString()} reviews from MovieBox and TMDB
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div
          className="max-w-4xl animate-pulse"
          role="status"
          aria-label="Loading reviews"
          aria-busy="true"
        >
          <div
            className="h-72 rounded-xl border sm:h-64"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          />
        </div>
      ) : error ? (
        <div
          className="max-w-4xl border p-6 sm:p-8"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
          role="alert"
        >
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {error}
          </p>
          <button
            type="button"
            onClick={() => void loadPage(1, false)}
            className="mt-4 rounded-md px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#F5C518", color: "#171717" }}
          >
            Try again
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div
          className="max-w-4xl border p-6 sm:p-8"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            There are no published reviews for this movie yet. Be the first to
            share your thoughts below.
          </p>
        </div>
      ) : activeReview ? (
        <div className="max-w-4xl">
          <div
            className="relative overflow-hidden border"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="h-1 w-full"
              style={{
                backgroundColor:
                  activeReview.source === "TMDB" ? "#F5C518" : "#8B5CF6",
              }}
            />

            <article
              key={activeReview.id}
              className="min-h-[330px] p-5 sm:min-h-[300px] sm:p-8 lg:p-10"
              aria-live="polite"
            >
              <div className="mb-7 flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  {getAvatarUrl(activeReview.avatarPath) ? (
                    <img
                      src={getAvatarUrl(activeReview.avatarPath) ?? undefined}
                      alt=""
                      loading="lazy"
                      className="h-12 w-12 shrink-0 rounded-full border object-cover"
                      style={{ borderColor: "var(--border)" }}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: "var(--background)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <UserRound size={20} aria-hidden="true" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p
                      className="truncate text-sm font-bold sm:text-base"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {activeReview.author}
                    </p>
                    <p
                      className="mt-1 text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {formatDate(activeReview.createdAt)}
                    </p>
                    <span
                      className="mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor:
                          activeReview.source === "TMDB"
                            ? "rgba(245, 197, 24, 0.12)"
                            : "rgba(139, 92, 246, 0.14)",
                        color:
                          activeReview.source === "TMDB"
                            ? "#F5C518"
                            : "#A78BFA",
                      }}
                    >
                      {activeReview.source}
                    </span>
                  </div>
                </div>

                {activeReview.rating !== null && (
                  <div
                    className="inline-flex shrink-0 items-center gap-2 px-3 py-2"
                    style={{ backgroundColor: "rgba(245, 197, 24, 0.12)" }}
                    aria-label={`Rating: ${activeReview.rating} out of ${
                      activeReview.source === "MovieBox" ? 5 : 10
                    }`}
                  >
                    <Star
                      size={16}
                      fill="#F5C518"
                      stroke="#F5C518"
                      aria-hidden="true"
                    />
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {activeReview.rating}
                      <span
                        className="ml-1 text-xs font-medium"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        /{activeReview.source === "MovieBox" ? "5" : "10"}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              <p
                className={`whitespace-pre-line break-words text-sm leading-7 sm:text-base sm:leading-8 ${
                  !activeExpanded && activeLongReview ? "line-clamp-6" : ""
                }`}
                style={{ color: "var(--text-secondary)" }}
              >
                {activeReview.content}
              </p>

              {activeLongReview && (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(activeReview.id)}
                    className="text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                    style={{ color: "#F5C518" }}
                  >
                    {activeExpanded ? "Read less" : "Read full review"}
                  </button>
                </div>
              )}
            </article>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div
              className="text-xs font-medium tabular-nums"
              style={{ color: "var(--text-secondary)" }}
              aria-live="polite"
            >
              <span style={{ color: "var(--text-primary)" }}>
                {activeIndex + 1}
              </span>{" "}
              / {reviews.length}
              <span className="ml-2 hidden sm:inline">
                · Slide to explore audience opinions
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => moveTo(activeIndex - 1)}
                disabled={!canGoBack}
                aria-label="Previous review"
                className="flex h-11 w-11 items-center justify-center border transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => moveTo(activeIndex + 1)}
                disabled={!canGoForward || loadingMore}
                aria-label="Next review"
                className="flex h-11 w-11 items-center justify-center border transition-colors hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                style={{
                  borderColor: "#F5C518",
                  backgroundColor: "#F5C518",
                  color: "#171717",
                }}
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>
          </div>

          {loadingMore && (
            <p
              className="mt-3 text-right text-xs"
              role="status"
              style={{ color: "var(--text-secondary)" }}
            >
              Loading more reviews…
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
