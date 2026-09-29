import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

export type MovieFilterKey =
  | "genre"
  | "language"
  | "year"
  | "rating";

export interface MovieFilters {
  genre: string;
  language: string;
  year: string;
  rating: string;
}

interface FilterOption {
  label: string;
  value: string;
}

interface MovieSectionFiltersProps {
  filters: MovieFilters;
  onChange: (
    key: MovieFilterKey,
    value: string,
  ) => void;
}

const GENRE_OPTIONS: FilterOption[] = [
  { label: "All Genres", value: "" },
  { label: "Action", value: "28" },
  { label: "Adventure", value: "12" },
  { label: "Animation", value: "16" },
  { label: "Comedy", value: "35" },
  { label: "Crime", value: "80" },
  { label: "Documentary", value: "99" },
  { label: "Drama", value: "18" },
  { label: "Fantasy", value: "14" },
  { label: "Horror", value: "27" },
  { label: "Mystery", value: "9648" },
  { label: "Romance", value: "10749" },
  {
    label: "Science Fiction",
    value: "878",
  },
  { label: "Thriller", value: "53" },
];

const LANGUAGE_OPTIONS: FilterOption[] = [
  { label: "All Languages", value: "" },
  { label: "English", value: "en" },
  { label: "Hindi", value: "hi" },
  { label: "Tamil", value: "ta" },
  { label: "Telugu", value: "te" },
  { label: "Malayalam", value: "ml" },
  { label: "Kannada", value: "kn" },
  { label: "Korean", value: "ko" },
  { label: "Japanese", value: "ja" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Chinese", value: "zh" },
];

const YEAR_OPTIONS: FilterOption[] = [
  { label: "All Years", value: "" },
  { label: "2026", value: "2026" },
  { label: "2025", value: "2025" },
  { label: "2024", value: "2024" },
  { label: "2023", value: "2023" },
  { label: "2022", value: "2022" },
  { label: "2021", value: "2021" },
  { label: "2020", value: "2020" },
];

const RATING_OPTIONS: FilterOption[] = [
  { label: "All Ratings", value: "" },
  { label: "9+", value: "9" },
  { label: "8+", value: "8" },
  { label: "7+", value: "7" },
  { label: "6+", value: "6" },
  { label: "5+", value: "5" },
];

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const containerRef =
    useRef<HTMLDivElement>(null);

  const selectedOption =
    options.find(
      (option) => option.value === value,
    ) ?? options[0];

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent,
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative z-30 shrink-0"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() =>
          setOpen((current) => !current)
        }
        className="relative z-30 flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors hover:border-zinc-400 dark:hover:border-zinc-600"
        style={{
          backgroundColor: "var(--card)",
          borderColor: value
            ? "var(--primary)"
            : "var(--border)",
          color: "var(--text-primary)",
        }}
      >
        <span>{label}</span>

        {value && (
          <span
            className="max-w-22.5 truncate font-semibold"
            style={{
              color: "var(--primary)",
            }}
          >
            {selectedOption.label}
          </span>
        )}

        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-100 mt-2 w-48 overflow-hidden rounded-lg border py-1 shadow-2xl"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
          role="listbox"
          aria-label={label}
        >
          <div
            className="max-h-72 overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
            }}
          >
            {options.map((option) => {
              const selected =
                option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  style={{
                    color: selected
                      ? "var(--primary)"
                      : "var(--text-primary)",
                  }}
                >
                  <span>{option.label}</span>

                  {selected && (
                    <Check size={14} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MovieSectionFilters({
  filters,
  onChange,
}: MovieSectionFiltersProps) {
  const hasActiveFilters =
    Boolean(
      filters.genre ||
        filters.language ||
        filters.year ||
        filters.rating,
    );

  const clearFilters = () => {
    onChange("genre", "");
    onChange("language", "");
    onChange("year", "");
    onChange("rating", "");
  };

  return (
    <div className="relative z-20 mt-5 overflow-visible pb-1">
      <div className="flex min-w-max items-center gap-2">
        <div
          className="mr-1 flex h-9 items-center gap-1.5 text-xs font-medium"
          style={{
            color: "var(--text-secondary)",
          }}
        >
          <SlidersHorizontal size={14} />
          <span>Filters</span>
        </div>

        <FilterDropdown
          label="Genre"
          value={filters.genre}
          options={GENRE_OPTIONS}
          onChange={(value) =>
            onChange("genre", value)
          }
        />

        <FilterDropdown
          label="Language"
          value={filters.language}
          options={LANGUAGE_OPTIONS}
          onChange={(value) =>
            onChange("language", value)
          }
        />

        <FilterDropdown
          label="Year"
          value={filters.year}
          options={YEAR_OPTIONS}
          onChange={(value) =>
            onChange("year", value)
          }
        />

        <FilterDropdown
          label="Rating"
          value={filters.rating}
          options={RATING_OPTIONS}
          onChange={(value) =>
            onChange("rating", value)
          }
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            <RotateCcw size={13} />
            <span>Clear</span>
          </button>
        )}
      </div>
    </div>
  );
}