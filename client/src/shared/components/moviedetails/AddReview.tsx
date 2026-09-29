import { useState } from "react";
import type { FormEvent } from "react";
import { Star } from "lucide-react";
import {
  createReview,
  type Review,
} from "../../services/movie.api";

interface AddReviewProps {
  tmdbId: string;
  onReviewCreated: (review: Review) => void;
}

export default function AddReview({
  tmdbId,
  onReviewCreated,
}: AddReviewProps) {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!content.trim()) {
      setError("Please write a review.");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const review = await createReview(
        tmdbId,
        {
          content: content.trim(),
          rating,
        },
      );

      onReviewCreated(review);

      setContent("");
      setRating(0);
      setSuccess("Review added successfully.");
    } catch (error) {
      console.error(
        "Failed to create review:",
        error,
      );

      setError(
        "Unable to submit your review. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
      <div className="max-w-3xl">
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
            Write a Review
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <p
              className="mb-3 text-sm font-medium"
              style={{
                color: "var(--text-primary)",
              }}
            >
              Your rating
            </p>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(
                (value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setRating(value)
                    }
                    aria-label={`Rate ${value} out of 5`}
                    className="p-1 transition-opacity hover:opacity-70"
                  >
                    <Star
                      size={22}
                      fill={
                        value <= rating
                          ? "currentColor"
                          : "none"
                      }
                      style={{
                        color:
                          value <= rating
                            ? "var(--primary)"
                            : "var(--text-secondary)",
                      }}
                    />
                  </button>
                ),
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="movie-review"
              className="mb-2 block text-sm font-medium"
              style={{
                color: "var(--text-primary)",
              }}
            >
              Your review
            </label>

            <textarea
              id="movie-review"
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              maxLength={2000}
              rows={5}
              placeholder="Share your thoughts about this movie..."
              className="w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          {success && (
            <p
              className="text-sm"
              style={{
                color: "var(--primary)",
              }}
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{
              backgroundColor: "var(--primary)",
            }}
          >
            {submitting
              ? "Submitting..."
              : "Submit Review"}
          </button>
        </form>
      </div>
    </section>
  );
}