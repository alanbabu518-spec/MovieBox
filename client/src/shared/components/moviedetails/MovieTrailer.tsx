import type { MovieVideo } from "../../../shared/services/movie.api";

interface MovieTrailerProps {
  trailer?: MovieVideo;
}

export default function MovieTrailer({
  trailer,
}: MovieTrailerProps) {
  if (!trailer || trailer.site !== "YouTube") {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
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
          Trailer
        </h2>
      </div>

      <div className="max-w-5xl overflow-hidden rounded-lg bg-black">
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${trailer.key}`}
            title={trailer.name}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}