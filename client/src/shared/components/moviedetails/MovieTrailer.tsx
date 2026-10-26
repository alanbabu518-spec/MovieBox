import { useState } from "react";
import { Play } from "lucide-react";

import type { MovieVideo } from "../../services/movie.api";

interface MovieTrailerProps {
  trailer?: MovieVideo;
}

/** Click-to-play: the YouTube iframe (heavy) only loads when asked for */
export default function MovieTrailer({ trailer }: MovieTrailerProps) {
  const [playing, setPlaying] = useState(false);

  if (!trailer || trailer.site !== "YouTube") {
    return null;
  }

  return (
    <div
      id="trailer"
      className="scroll-mt-28 overflow-hidden rounded-2xl border border-line bg-black"
    >
      <div className="relative aspect-video">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
            title={trailer.name}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${trailer.name}`}
            className="group absolute inset-0"
          >
            <img
              src={`https://i.ytimg.com/vi/${trailer.key}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover opacity-80"
            />

            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-black shadow-xl transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
                <Play size={26} fill="currentColor" strokeWidth={0} className="ml-1" />
              </span>
            </span>
          </button>
        )}
      </div>

      <p className="px-4 py-3 text-sm font-semibold">{trailer.name}</p>
    </div>
  );
}