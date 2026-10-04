import { Film, RotateCw } from "lucide-react";

const bone = "animate-pulse rounded-md";
const boneStyle = { backgroundColor: "var(--card)" };

function Bone({ className = "" }: { className?: string }) {
  return <div className={`${bone} ${className}`} style={boneStyle} />;
}

export function MovieDetailsSkeleton() {
  return (
    <div role="status" aria-label="Loading movie details">
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-24 lg:px-8">
        <div className="grid grid-cols-[110px_1fr] items-end gap-5 sm:grid-cols-[170px_1fr] sm:gap-8 lg:grid-cols-[250px_1fr]">
          <Bone className="aspect-2/3 w-full rounded-xl" />
          <div className="space-y-4">
            <Bone className="h-10 w-3/4" />
            <Bone className="h-4 w-1/3" />
            <div className="flex gap-2">
              <Bone className="h-7 w-20" />
              <Bone className="h-7 w-20" />
              <Bone className="h-7 w-20" />
            </div>
            <Bone className="hidden h-16 w-full max-w-xl sm:block" />
            <div className="flex gap-3 pt-2">
              <Bone className="h-11 w-36" />
              <Bone className="h-11 w-11" />
              <Bone className="h-11 w-11" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-14 px-6 lg:px-8">
        <Bone className="h-20 w-full max-w-4xl" />

        <div>
          <Bone className="mb-6 h-7 w-24" />
          <div className="flex gap-5 overflow-hidden">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="w-28 flex-none sm:w-32">
                <Bone className="aspect-3/4 w-full rounded-lg" />
                <Bone className="mt-3 h-4 w-4/5" />
                <Bone className="mt-2 h-3 w-3/5" />
              </div>
            ))}
          </div>
        </div>

        <Bone className="aspect-video w-full max-w-5xl rounded-xl" />

        <div>
          <Bone className="mb-6 h-7 w-40" />
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Bone key={i} className="aspect-2/3 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ErrorProps {
  message: string;
  onRetry: () => void;
  onBack: () => void;
}

export function MovieDetailsError({ message, onRetry, onBack }: ErrorProps) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <div
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        <Film size={26} style={{ color: "var(--text-secondary)" }} />
      </div>

      <h1
        className="font-display text-2xl font-bold sm:text-3xl"
        style={{ color: "var(--text-primary)" }}
      >
        We couldn't load this movie
      </h1>

      <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
        {message} Check your connection and try again, or head back to keep browsing.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <RotateCw size={15} />
          Try again
        </button>

        <button
          type="button"
          onClick={onBack}
          className="rounded-md border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white/5"
          style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
        >
          Go back
        </button>
      </div>
    </div>
  );
}