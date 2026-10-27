import { useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, MessageSquareText, Send, Star } from "lucide-react";
import { createReview, type Review } from "../../services/movie.api";

interface AddReviewProps {
  tmdbId: string;
  onReviewCreated: (review: Review) => void;
}

const STAR_COLOR = "#F5C518";

export default function AddReview({
  tmdbId,
  onReviewCreated,
}: AddReviewProps) {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!content.trim()) {
      setError("Write a few words about the movie before submitting.");
      setSuccess("");
      return;
    }

    if (rating === 0) {
      setError("Choose a star rating to continue.");
      setSuccess("");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const review = await createReview(tmdbId, {
        content: content.trim(),
        rating,
      });

      onReviewCreated(review);
      setContent("");
      setRating(0);
      setHoverRating(0);
      setSuccess("Your review is live. Thanks for sharing your take!");
    } catch (submitError) {
      console.error("Failed to create review:", submitError);
      setError("We couldn't submit your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
      <div className="max-w-3xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        {/* Header */}
        <div className="border-b border-[var(--border)] px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-start gap-3.5">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
              style={{
                color: "var(--primary)",
                backgroundColor:
                  "color-mix(in srgb, var(--primary) 12%, transparent)",
              }}
            >
              <MessageSquareText size={19} aria-hidden="true" />
            </span>

            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.18em]"
                style={{ color: "var(--primary)" }}
              >
                Your voice matters
              </p>

              <h2
                className="mt-1 font-display text-xl font-bold tracking-tight sm:text-2xl"
                style={{ color: "var(--text-primary)" }}
              >
                Write a review
              </h2>

              <p
                className="mt-1.5 max-w-xl text-sm leading-6"
                style={{ color: "var(--text-secondary)" }}
              >
                Loved it or not your thing? Share an honest take with the
                MovieBox community.
              </p>
            </div>
          </div>
        </div>

        {/* Review form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 px-5 py-5 sm:px-7 sm:py-7"
        >
          {/* Star rating */}
          <fieldset>
            <legend
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Your rating <span className="text-red-400">*</span>
            </legend>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <div
                className="flex items-center gap-1"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((value) => {
                  const filled = value <= (hoverRating || rating);

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setRating(value);
                        setError("");
                      }}
                      onMouseEnter={() => setHoverRating(value)}
                      aria-label={`Rate ${value} out of 5 stars`}
                      aria-pressed={rating === value}
                      className="grid h-10 w-10 place-items-center rounded-lg transition-colors hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                    >
                      <Star
                        size={23}
                        strokeWidth={1.8}
                        fill={filled ? STAR_COLOR : "none"}
                        style={{
                          color: filled
                            ? STAR_COLOR
                            : "var(--text-secondary)",
                        }}
                      />
                    </button>
                  );
                })}
              </div>

              <span
                className="ml-2 text-sm font-semibold"
                style={{
                  color: rating
                    ? STAR_COLOR
                    : "var(--text-secondary)",
                }}
                aria-live="polite"
              >
                {rating ? `${rating} out of 5` : "Select a rating"}
              </span>
            </div>
          </fieldset>

          {/* Review content */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="movie-review"
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Your review <span className="text-red-400">*</span>
              </label>

              <span
                className="text-xs tabular-nums"
                style={{
                  color:
                    content.length >= 1900
                      ? "var(--primary)"
                      : "var(--text-secondary)",
                }}
              >
                {content.length}/2000
              </span>
            </div>

            <textarea
              id="movie-review"
              value={content}
              onChange={(event) => {
                setContent(event.target.value);
                if (error) setError("");
              }}
              maxLength={2000}
              rows={5}
              required
              placeholder="What stood out? The story, performances, visuals—or something that missed the mark?"
              className="w-full resize-y rounded-xl border px-4 py-3.5 text-sm leading-6 outline-none transition-colors placeholder:opacity-60 focus:ring-2 focus:ring-[var(--primary)]/20"
              style={{
                minHeight: "132px",
                backgroundColor: "var(--background, var(--card))",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />

            <p
              className="mt-2 text-xs leading-5"
              style={{ color: "var(--text-secondary)" }}
            >
              Keep it thoughtful and spoiler-free for other movie fans.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/25 bg-red-500/[0.06] px-3.5 py-3 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          {/* Success message */}
          {success && (
            <p
              role="status"
              className="flex items-start gap-2 rounded-lg border px-3.5 py-3 text-sm"
              style={{
                color: "var(--text-primary)",
                borderColor:
                  "color-mix(in srgb, var(--primary) 35%, var(--border))",
                backgroundColor:
                  "color-mix(in srgb, var(--primary) 8%, transparent)",
              }}
            >
              <CheckCircle2
                size={17}
                className="mt-0.5 shrink-0"
                style={{ color: "var(--primary)" }}
              />
              {success}
            </p>
          )}

          {/* Submit button */}
          <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p
              className="text-xs leading-5"
              style={{ color: "var(--text-secondary)" }}
            >
              Your review helps others decide what to watch.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55"
              style={{ backgroundColor: "var(--primary)" }}
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  Submitting review…
                </>
              ) : (
                <>
                  <Send size={15} aria-hidden="true" />
                  Publish review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}