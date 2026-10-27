import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { GENRES } from "../../constants/genres";

const LANGUAGES = [
  { id: "en", name: "English" },
  { id: "hi", name: "Hindi" },
  { id: "ta", name: "Tamil" },
  { id: "te", name: "Telugu" },
  { id: "ml", name: "Malayalam" },
  { id: "kn", name: "Kannada" },
  { id: "ko", name: "Korean" },
  { id: "ja", name: "Japanese" },
  { id: "es", name: "Spanish" },
  { id: "fr", name: "French" },
  { id: "de", name: "German" },
  { id: "zh", name: "Chinese" },
];

const CATEGORIES = [
  { id: "popular", name: "Popular" },
  { id: "trending", name: "Trending" },
  { id: "upcoming", name: "Upcoming" },
];

const RATINGS = [
  { id: "", name: "Any" },
  { id: "9", name: "9+" },
  { id: "8", name: "8+" },
  { id: "7", name: "7+" },
  { id: "6", name: "6+" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, index) =>
  String(currentYear - index),
);

export interface DiscoverValues {
  category: string;
  genre: string;
  language: string;
  year: string;
  rating: string;
}

interface DiscoverFiltersProps {
  values: DiscoverValues;
  onChange: (key: keyof DiscoverValues, value: string) => void;
  onReset: () => void;
  hasActive: boolean;
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-[transform,background-color,border-color,color] duration-150 active:scale-95",
        active
          ? "border-brand bg-brand text-white"
          : "border-line bg-white/5 text-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

const selectClass =
  "h-11 w-full rounded-xl border border-line bg-card px-3 text-sm text-ink outline-none focus:border-brand/70";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-b border-line py-5 first:pt-0 last:border-0">
      <legend className="mb-3 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

export default function DiscoverFilters({
  values,
  onChange,
  onReset,
  hasActive,
}: DiscoverFiltersProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Filters</h2>

        {hasActive && (
          <button
            type="button"
            onClick={onReset}
            className="text-sm font-medium text-brand transition-opacity hover:opacity-80"
          >
            Clear all
          </button>
        )}
      </div>

      <Group title="Browse">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((item) => (
            <Chip
              key={item.id}
              active={values.category === item.id}
              onClick={() => onChange("category", item.id)}
            >
              {item.name}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Genre">
        <div className="flex flex-wrap gap-2">
          {GENRES.map((item) => (
            <Chip
              key={item.id}
              active={values.genre === item.id}
              onClick={() =>
                onChange("genre", values.genre === item.id ? "" : item.id)
              }
            >
              {item.name}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Rating">
        <div className="flex flex-wrap gap-2">
          {RATINGS.map((item) => (
            <Chip
              key={item.name}
              active={values.rating === item.id}
              onClick={() => onChange("rating", item.id)}
            >
              {item.id ? `★ ${item.name}` : item.name}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Language">
        <select
          aria-label="Language"
          value={values.language}
          onChange={(event) => onChange("language", event.target.value)}
          className={selectClass}
        >
          <option value="">All languages</option>
          {LANGUAGES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </Group>

      <Group title="Release year">
        <select
          aria-label="Release year"
          value={values.year}
          onChange={(event) => onChange("year", event.target.value)}
          className={selectClass}
        >
          <option value="">All years</option>
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </Group>
    </div>
  );
}
