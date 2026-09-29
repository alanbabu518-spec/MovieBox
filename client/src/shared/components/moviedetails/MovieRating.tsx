import { useEffect, useState } from "react";
import { Star } from "lucide-react";

import {
  getRatingStats,
  rateMovie,
  type RatingStats,
} from "../../services/movie.api";

interface MovieRatingProps {
  tmdbId: string;
}

export default function MovieRating({
  tmdbId,
}: MovieRatingProps) {
  const [stats, setStats] =
    useState<RatingStats | null>(null);

  const [selectedRating, setSelectedRating] =
    useState(0);

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    const loadRating = async () => {
      try {
        const data = await getRatingStats(tmdbId);

        setStats(data);
        setSelectedRating(data.userRating ?? 0);
      } catch (error) {
        console.error(
          "Failed to load rating:",
          error,
        );
      }
    };

    loadRating();
  }, [tmdbId]);

  const handleRating = async (
    value: number,
  ) => {
    try {
      setSubmitting(true);

      const data = await rateMovie(
        tmdbId,
        value,
      );

      setStats(data);
      setSelectedRating(
        data.userRating ?? value,
      );
    } catch (error) {
      console.error(
        "Failed to submit rating:",
        error,
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!stats) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
      <div className="max-w-xl">
        <div className="mb-7">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-[0.22em]"
            style={{
              color: "var(--primary)",
            }}
          >
            MovieBox
          </p>

          <h2
            className="font-display text-2xl font-bold sm:text-3xl"
            style={{
              color: "var(--text-primary)",
            }}
          >
            Ratings
          </h2>
        </div>

        <div
          className="flex flex-wrap items-center gap-8 border-y py-6"
          style={{
            borderColor: "var(--border)",
          }}
        >
          <div>
            <div className="flex items-center gap-2">
              <Star
                size={20}
                fill="currentColor"
                style={{
                  color: "var(--primary)",
                }}
              />

              <span
                className="text-2xl font-bold"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                {stats.average.toFixed(1)}
              </span>
            </div>

            <p
              className="mt-1 text-xs"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {stats.total} ratings
            </p>
          </div>

          <div>
            <p
              className="mb-3 text-sm font-medium"
              style={{
                color: "var(--text-primary)",
              }}
            >
              Rate this movie
            </p>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(
                (rating) => (
                  <button
                    key={rating}
                    type="button"
                    disabled={submitting}
                    onClick={() =>
                      handleRating(rating)
                    }
                    aria-label={`Rate ${rating} out of 5`}
                    className="p-1 transition-opacity hover:opacity-70 disabled:opacity-50"
                  >
                    <Star
                      size={20}
                      fill={
                        rating <=
                        selectedRating
                          ? "currentColor"
                          : "none"
                      }
                      style={{
                        color:
                          rating <=
                          selectedRating
                            ? "var(--primary)"
                            : "var(--text-secondary)",
                      }}
                    />
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}