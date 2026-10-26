import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  Bookmark,
  Compass,
  Heart,
  House,
  Moon,
  Search,
  Sun,
  User,
  X,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";

import { useAuth } from "../../context/AuthContext";
import { useThemeStore } from "../../../store/theme.store";
import { cn } from "../../lib/cn";

interface NavbarProps {
  /** Transparent over a full-bleed hero until the page scrolls */
  overlay?: boolean;
}

interface NavItem {
  label: string;
  to: string;
  category?: string;
  auth?: boolean;
  dot?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Movies", to: "/movies?category=popular", category: "popular", auth: true },
  { label: "Trending", to: "/movies?category=trending", category: "trending", auth: true },
  { label: "Upcoming", to: "/movies?category=upcoming", category: "upcoming", auth: true },
  { label: "AI Search", to: "/ai/search", auth: true, dot: true },
];

const TAB_ITEMS = [
  { label: "Home", to: "/", icon: House, auth: false },
  { label: "Discover", to: "/movies", icon: Compass, auth: true },
  { label: "Favorites", to: "/favorites", icon: Heart, auth: true },
  { label: "Watchlist", to: "/watchlist", icon: Bookmark, auth: true },
  { label: "Profile", to: "/profile", icon: User, auth: true },
] as const;

export default function Navbar({ overlay = false }: NavbarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params] = useSearchParams();

  const { user, loading } = useAuth();
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const [scrolled, setScrolled] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [query, setQuery] = useState("");

  const sentinel = useRef<HTMLDivElement>(null);

  /* Solid header once the page leaves the top: IntersectionObserver, no scroll listener */
  useEffect(() => {
    const node = sentinel.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) =>
      setScrolled(!entry.isIntersecting),
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  /* Tell the stylesheet to leave room for the tab bar */
  useEffect(() => {
    document.documentElement.classList.add("has-bottom-nav");

    return () =>
      document.documentElement.classList.remove("has-bottom-nav");
  }, []);

  const solid = scrolled || !overlay;

  const gate = (
    event: React.MouseEvent,
    auth: boolean | undefined,
  ) => {
    if (!auth) {
      return;
    }

    if (loading) {
      event.preventDefault();
      return;
    }

    if (!user) {
      event.preventDefault();
      navigate("/signin");
    }
  };

  const isActive = (item: NavItem) => {
    if (item.to === "/") {
      return pathname === "/";
    }

    if (item.category) {
      return (
        pathname === "/movies" &&
        (params.get("category") ?? "popular") === item.category
      );
    }

    return pathname.startsWith(item.to);
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();

    const value = query.trim();

    if (!value || loading) {
      return;
    }

    if (!user) {
      navigate("/signin");
      return;
    }

    setMobileSearch(false);
    navigate(`/movies?category=popular&q=${encodeURIComponent(value)}`);
  };

  const avatarId = user?.avatar || "avatar-1";
  const avatarNumber = Number(avatarId.replace("avatar-", ""));

  const avatarSrc =
    avatarId === "avatar-1" ||
    !Number.isInteger(avatarNumber) ||
    avatarNumber < 2 ||
    avatarNumber > 10
      ? null
      : `/avatars/avatar${avatarNumber - 1}.svg`;

  const avatarFallback =
    user?.name?.trim().charAt(0).toUpperCase() || "U";

  const iconButton =
    "h-10 w-10 place-items-center rounded-full text-muted transition-[transform,background-color,color] duration-150 active:scale-90 hover:bg-white/10 hover:text-ink";

  const profileLink = (
    <Link to="/profile" aria-label="Profile" className="ml-1 shrink-0">
      <Avatar className="h-8 w-8 ring-1 ring-line">
        {avatarSrc && <AvatarImage src={avatarSrc} alt={user?.name ?? ""} />}
        <AvatarFallback className="bg-brand text-sm font-semibold text-white">
          {avatarFallback}
        </AvatarFallback>
      </Avatar>
    </Link>
  );

  return (
    <>
      <div
        ref={sentinel}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-12"
      />

      <header className="pt-safe fixed inset-x-0 top-0 z-50 isolate">
        {/* gradient scrim (always) + solid glass layer that fades in on scroll */}
        {overlay && (
          <div className="absolute inset-0 -z-20 bg-linear-to-b from-black/70 to-transparent" />
        )}

        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 -z-10 border-b border-line bg-canvas/85 backdrop-blur-xl transition-opacity duration-300",
            solid ? "opacity-100" : "opacity-0",
          )}
        />

        <nav
          aria-label="Main"
          className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-4 sm:px-6 lg:px-8"
        >
          <Link
            to="/"
            aria-label="MovieBox home"
            className="shrink-0 font-display text-xl font-extrabold tracking-tight text-white"
          >
            Movie<span className="text-brand">Box</span>
          </Link>

          {/* Desktop links */}
          <ul className="ml-2 hidden h-full items-stretch md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);

              return (
                <li key={item.label} className="flex">
                  <Link
                    to={item.to}
                    onClick={(event) => gate(event, item.auth)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-1.5 px-3.5 text-sm font-medium transition-colors duration-150 hover:text-white",
                      active ? "text-white" : "text-white/65",
                    )}
                  >
                    {item.dot && (
                      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                    )}

                    {item.label}

                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-x-3.5 bottom-0 h-0.5 origin-left rounded-full bg-brand transition-transform duration-300 ease-out",
                        active ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="ml-auto flex items-center gap-1">
            {/* Desktop search */}
            <form
              role="search"
              onSubmit={submitSearch}
              className="relative mr-2 hidden md:block"
            >
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search movies…"
                enterKeyHint="search"
                aria-label="Search movies"
                className="h-10 w-56 rounded-full border border-line bg-white/6 pl-10 pr-4 text-sm text-ink outline-none transition-[width,border-color] duration-300 placeholder:text-muted focus:w-72 focus:border-brand/60 lg:w-64 lg:focus:w-80"
              />
            </form>

            {/* Mobile search toggle */}
            <button
              type="button"
              aria-label={mobileSearch ? "Close search" : "Search"}
              aria-expanded={mobileSearch}
              onClick={() => setMobileSearch((open) => !open)}
              className={cn(iconButton, "grid md:hidden")}
            >
              {mobileSearch ? <X size={19} /> : <Search size={19} />}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              className={cn(iconButton, "grid")}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {!loading && user && (
              <>
                <Link
                  to="/favorites"
                  aria-label="Favorites"
                  className={cn(iconButton, "hidden md:grid")}
                >
                  <Heart size={18} />
                </Link>

                {profileLink}
              </>
            )}

            {!loading && !user && (
              <Link
                to="/signin"
                className="ml-1 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-[transform,background-color] duration-150 hover:bg-brand-hover active:scale-95"
              >
                Sign in
              </Link>
            )}
          </div>
        </nav>

        {mobileSearch && (
          <form
            role="search"
            onSubmit={submitSearch}
            className="animate-fade mx-auto max-w-[1400px] px-4 pb-3 md:hidden"
          >
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                autoFocus
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoCapitalize="none"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search movies…"
                aria-label="Search movies"
                className="h-12 w-full rounded-2xl border border-line bg-surface pl-11 pr-4 text-ink outline-none focus:border-brand/70"
              />
            </div>
          </form>
        )}
      </header>

      {!overlay && (
        <div
          aria-hidden="true"
          className="h-[calc(3.5rem+env(safe-area-inset-top,0px))]"
        />
      )}

      {/* Mobile tab bar */}
      <nav
        aria-label="Primary"
        className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-line bg-canvas/90 backdrop-blur-xl md:hidden"
      >
        <ul className="grid grid-cols-5">
          {TAB_ITEMS.map(({ label, to, icon: Icon, auth }) => {
            const active =
              to === "/" ? pathname === "/" : pathname.startsWith(to);

            return (
              <li key={label}>
                <Link
                  to={to}
                  onClick={(event) => gate(event, auth)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex h-14 flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium transition-colors duration-150",
                    active ? "text-brand" : "text-muted",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-0 h-0.5 w-8 rounded-full bg-brand shadow-[0_0_12px_2px_var(--primary)] transition-opacity duration-200",
                      active ? "opacity-100" : "opacity-0",
                    )}
                  />

                  <Icon
                    size={22}
                    strokeWidth={active ? 2.3 : 1.8}
                    className="transition-transform duration-150 group-active:scale-90"
                  />

                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}