import type { ReactNode } from "react";
import {
  Check,
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Star,
} from "lucide-react";
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
  { id: "", name: "Any rating" },
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
  className,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-medium leading-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.98]",
        active
          ? "border-brand/70 bg-brand/10 text-ink shadow-[inset_0_0_0_1px_var(--brand)]"
          : "border-line bg-transparent text-muted hover:border-white/20 hover:bg-white/[0.04] hover:text-ink",
        className,
      )}
    >
      {active && <Check aria-hidden="true" size={13} className="text-brand" />}
      {children}
    </button>
  );
}

const selectClass =
  "h-11 w-full appearance-none rounded-lg border border-line bg-card px-3 pr-9 text-sm text-ink outline-none transition-colors hover:border-white/20 focus:border-brand/70 focus:ring-2 focus:ring-brand/15";

function Group({
  title,
  hint,
  children,
  trailing,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <fieldset className="border-b border-line py-5 first:pt-0 last:border-0 last:pb-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <legend className="text-[13px] font-semibold tracking-wide text-ink">
            {title}
          </legend>
          {hint && <p className="mt-1 text-xs leading-5 text-muted">{hint}</p>}
        </div>
        {trailing}
      </div>
      {children}
    </fieldset>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string }[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={selectClass}
      >
        <option value="">{placeholder}</option>
        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

export default function DiscoverFilters({
  values,
  onChange,
  onReset,
  hasActive,
}: DiscoverFiltersProps) {
  const activeCount = [
    values.category !== "popular" && values.category,
    values.genre,
    values.language,
    values.year,
    values.rating,
  ].filter(Boolean).length;

  return (
    <div className="text-ink">
      {/* Compact, editorial header: useful in both sidebar and mobile sheet. */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-white/[0.035] text-brand">
            <SlidersHorizontal size={16} aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">
              Refine discovery
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted">
              Fine-tune your next movie night.
            </p>
          </div>
        </div>
        {hasActive && (
          <span className="mt-1 inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-brand/30 bg-brand/10 px-1.5 text-[11px] font-semibold text-brand">
            {activeCount}
          </span>
        )}
      </div>

      <Group title="Explore" hint="Choose a collection">
        <div className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-black/10 p-1">
          {CATEGORIES.map((item) => {
            const active = values.category === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => onChange("category", item.id)}
                className={cn(
                  "min-h-9 rounded-lg px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70",
                  active
                    ? "bg-brand text-white shadow-sm"
                    : "text-muted hover:bg-white/[0.05] hover:text-ink",
                )}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      </Group>

      <Group
        title="Genre"
        hint={values.genre ? "One genre selected" : "Find the mood you're in"}
        trailing={
          values.genre ? (
            <button
              type="button"
              onClick={() => onChange("genre", "")}
              className="text-xs font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
            >
              Clear
            </button>
          ) : null
        }
      >
        <div className="flex flex-wrap gap-1.5">
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

      <Group title="Audience rating" hint="Set a minimum community score">
        <div className="grid grid-cols-4 gap-1.5">
          {RATINGS.map((item) => {
            const active = values.rating === item.id;
            return (
              <Chip
                key={item.name}
                active={active}
                onClick={() => onChange("rating", item.id)}
                className="w-full px-1.5"
              >
                {item.id ? (
                  <>
                    <Star
                      size={12}
                      aria-hidden="true"
                      className={active ? "fill-current" : "text-brand"}
                    />
                    {item.name}
                  </>
                ) : (
                  "Any"
                )}
              </Chip>
            );
          })}
        </div>
      </Group>

      <Group title="Language" hint="Browse films in your preferred language">
        <SelectField
          label="Language"
          value={values.language}
          onChange={(value) => onChange("language", value)}
          options={LANGUAGES}
          placeholder="All languages"
        />
      </Group>

      <Group title="Release year" hint="Narrow down by release date">
        <SelectField
          label="Release year"
          value={values.year}
          onChange={(value) => onChange("year", value)}
          options={YEARS.map((year) => ({ id: year, name: year }))}
          placeholder="Any year"
        />
      </Group>

      {hasActive && (
        <div className="mt-5 border-t border-line pt-4">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-medium text-muted transition-colors hover:border-white/20 hover:bg-white/[0.04] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Reset all filters
          </button>
        </div>
      )}

      <div className="mt-5 flex items-start gap-2 border-t border-line pt-4 text-xs leading-5 text-muted">
        <Sparkles
          size={14}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-brand"
        />
        <p>
          Tip: combine a genre, language, and rating to discover hidden gems.
        </p>
      </div>
    </div>
  );
}
