import {
  Bookmark,
  ChevronDown,
  Clock3,
  Heart,
  History,
  Menu,
  Moon,
  Search,
  Sparkles,
  Star,
  Sun,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { useAuth } from "../../../shared/context/AuthContext";

import { useThemeStore } from "../../../store/theme.store";

type DropdownItem = {
  label: string;
  description: string;
  icon: typeof Star;
  href: string;
};

type DropdownSection = {
  title: string;
  items: DropdownItem[];
};

const movieSections: DropdownSection[] = [
  {
    title: "Explore Movies",
    items: [
      {
        label: "Popular",
        description: "Movies everyone is watching",
        icon: Star,
        href: "/movies",
      },
      {
        label: "Trending",
        description: "What's hot right now",
        icon: TrendingUp,
        href: "/movies",
      },
      {
        label: "Upcoming",
        description: "Movies coming soon",
        icon: Clock3,
        href: "/movies",
      },
    ],
  },
  {
    title: "Your Movies",
    items: [
      {
        label: "Watchlist",
        description: "Movies you want to watch",
        icon: Bookmark,
        href: "/watchlist",
      },
      {
        label: "Favorites",
        description: "Your favorite movies",
        icon: Heart,
        href: "/favorites",
      },
      {
        label: "History",
        description: "Recently watched movies",
        icon: History,
        href: "/profile",
      },
    ],
  },
];

const discoverSections: DropdownSection[] = [
  {
    title: "Discover",
    items: [
      {
        label: "Search Movies",
        description: "Find your next movie",
        icon: Search,
        href: "/search",
      },
      {
        label: "Genres",
        description: "Browse movies by genre",
        icon: Sparkles,
        href: "/movies",
      },
      {
        label: "Top Rated",
        description: "Highly rated movies",
        icon: Star,
        href: "/movies",
      },
    ],
  },
];

function DropdownMenu({
  sections,
  open,
}: {
  sections: DropdownSection[];
  open: boolean;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="absolute left-0 top-full pt-2">
      <div
        className="w-max min-w-115 rounded-xl border p-4 shadow-2xl"
        style={{
          backgroundColor: "var(--background)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex gap-8">
          {sections.map((section) => (
            <div key={section.title} className="min-w-52.5">
              <p
                className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                {section.title}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="group flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors group-hover:border-(--primary)] group-hover:bg-(--primary)] group-hover:text-white"
                        style={{
                          borderColor: "var(--border)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <Icon size={17} strokeWidth={1.8} />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="text-sm font-medium"
                          style={{
                            color: "var(--text-primary)",
                          }}
                        >
                          {item.label}
                        </p>

                        <p
                          className="mt-0.5 text-xs"
                          style={{
                            color: "var(--text-secondary)",
                          }}
                        >
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMovieOpen, setMobileMovieOpen] = useState(false);
  const [mobileDiscoverOpen, setMobileDiscoverOpen] = useState(false);
  const [isThemeAnimating, setIsThemeAnimating] = useState(false);
  const [themeReveal, setThemeReveal] = useState(false);

  const { user, loading, logout } = useAuth();

  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const closeMenus = () => {
    setOpenMenu(null);
    setMobileOpen(false);
    setMobileMovieOpen(false);
    setMobileDiscoverOpen(false);
  };

  const handleThemeToggle = () => {
    if (isThemeAnimating) {
      return;
    }

    setIsThemeAnimating(true);
    setThemeReveal(true);

    window.setTimeout(() => {
      toggleTheme();
    }, 250);

    window.setTimeout(() => {
      setThemeReveal(false);
    }, 800);

    window.setTimeout(() => {
      setIsThemeAnimating(false);
    }, 900);
  };

  const handleLogout = async () => {
    try {
      await logout();
      closeMenus();
    } catch {
      return;
    }
  };

  const avatarId = user?.avatar || "avatar-1";

  return (
    <>
      <div
        className={`pointer-events-none fixed inset-0 z-40 overflow-hidden ${
          themeReveal ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      >
        <div
          className={`absolute inset-0 origin-center transition-transform duration-800 ease-[cubic-bezier(0.76,0,0.24,1)] ${
            themeReveal ? "scale-100" : "scale-0"
          }`}
          style={{
            backgroundColor: "var(--background)",
          }}
        />
      </div>

      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--background) 90%, transparent)",
          borderColor: "var(--border)",
        }}
      >
        <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            onClick={closeMenus}
            className="group flex shrink-0 items-center gap-2"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-md transition-transform duration-200 group-hover:scale-105"
              style={{
                backgroundColor: "var(--primary)",
              }}
            >
              <span className="font-display text-base font-bold text-white">
                M
              </span>
            </div>

            <span
              className="font-display text-lg font-bold tracking-tight"
              style={{
                color: "var(--text-primary)",
              }}
            >
              MOVIE
              <span style={{ color: "var(--primary)" }}>BOX</span>
            </span>
          </Link>

          <div className="hidden h-full items-center md:flex">
            <Link
              to="/"
              className="flex h-full items-center px-3 text-sm font-medium transition-colors hover:text-(--primary)]"
              style={{
                color: "var(--text-primary)",
              }}
            >
              Home
            </Link>

            <div
              className="relative h-full"
              onMouseEnter={() => setOpenMenu("movies")}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button
                type="button"
                className="group flex h-full items-center gap-1 px-3 text-sm font-medium transition-colors hover:text-(--primary)]"
                style={{
                  color:
                    openMenu === "movies"
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                }}
              >
                Movies

                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    openMenu === "movies" ? "rotate-180" : ""
                  }`}
                />
              </button>

              <DropdownMenu
                sections={movieSections}
                open={openMenu === "movies"}
              />
            </div>

            <div
              className="relative h-full"
              onMouseEnter={() => setOpenMenu("discover")}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button
                type="button"
                className="group flex h-full items-center gap-1 px-3 text-sm font-medium transition-colors hover:text-(--primary)]"
                style={{
                  color:
                    openMenu === "discover"
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                }}
              >
                Discover

                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    openMenu === "discover" ? "rotate-180" : ""
                  }`}
                />
              </button>

              <DropdownMenu
                sections={discoverSections}
                open={openMenu === "discover"}
              />
            </div>

            <Link
              to="/ai"
              className="flex items-center gap-1.5 px-3 text-sm font-medium transition-colors hover:text-(--text-primary)]"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: "var(--primary)",
                }}
              />
              AI
            </Link>
          </div>

          <div className="flex items-center gap-0.5">
            <Link
              to="/search"
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              <Search size={18} strokeWidth={1.8} />
            </Link>

            <button
              type="button"
              onClick={handleThemeToggle}
              disabled={isThemeAnimating}
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              aria-pressed={theme === "dark"}
              className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full transition-transform duration-200 hover:scale-110 hover:bg-black/5 disabled:cursor-default dark:hover:bg-white/10"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              <span
                className={`absolute inset-0 rounded-full transition-transform duration-500 ${
                  isThemeAnimating ? "scale-100" : "scale-0"
                }`}
                style={{
                  backgroundColor: "var(--primary)",
                }}
              />

              <span
                className={`relative z-10 transition-all duration-300 ${
                  isThemeAnimating
                    ? "rotate-180 scale-75 text-white"
                    : "rotate-0 scale-100"
                }`}
              >
                {theme === "dark" ? (
                  <Sun size={18} strokeWidth={1.8} />
                ) : (
                  <Moon size={18} strokeWidth={1.8} />
                )}
              </span>
            </button>

            {!loading &&
              (user ? (
                <>
                  <Link
                    to="/favorites"
                    aria-label="Favorites"
                    className="hidden h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10 sm:flex"
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  >
                    <Heart size={18} strokeWidth={1.8} />
                  </Link>

                  <Link
                    to="/profile"
                    aria-label="Profile"
                    className="ml-1 hidden sm:flex"
                  >
                    <Avatar className="h-8 w-8 transition-opacity hover:opacity-90">
                      <AvatarImage
                        src={`/avatars/${avatarId}.svg`}
                        alt={user.name}
                      />
                      <AvatarFallback
                        style={{
                          backgroundColor: "var(--primary)",
                          color: "white",
                        }}
                      >
                        {user.name
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </>
              ) : (
                <div className="ml-1 hidden items-center gap-1.5 sm:flex">
                  <Link
                    to="/signin"
                    className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                    style={{
                      color: "var(--text-primary)",
                    }}
                  >
                    Sign in
                  </Link>

                  <Link
                    to="/signin"
                    className="rounded-md px-3.5 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: "var(--primary)",
                    }}
                  >
                    Get Started
                  </Link>
                </div>
              ))}

            <button
              type="button"
              aria-label={
                mobileOpen ? "Close menu" : "Open menu"
              }
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10 md:hidden"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {mobileOpen ? (
                <X size={20} strokeWidth={1.8} />
              ) : (
                <Menu size={20} strokeWidth={1.8} />
              )}
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <div
            className="border-t md:hidden"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
            }}
          >
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
              <Link
                to="/"
                onClick={closeMenus}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                Home
              </Link>

              <button
                type="button"
                onClick={() =>
                  setMobileMovieOpen((open) => !open)
                }
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                Movies

                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    mobileMovieOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileMovieOpen && (
                <div className="mb-1 ml-3 border-l pl-3">
                  {movieSections.flatMap((section) =>
                    section.items.map((item) => {
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.label}
                          to={item.href}
                          onClick={closeMenus}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                          style={{
                            color: "var(--text-secondary)",
                          }}
                        >
                          <Icon size={15} />
                          {item.label}
                        </Link>
                      );
                    }),
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  setMobileDiscoverOpen((open) => !open)
                }
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                Discover

                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    mobileDiscoverOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileDiscoverOpen && (
                <div className="mb-1 ml-3 border-l pl-3">
                  {discoverSections.flatMap((section) =>
                    section.items.map((item) => {
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.label}
                          to={item.href}
                          onClick={closeMenus}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                          style={{
                            color: "var(--text-secondary)",
                          }}
                        >
                          <Icon size={15} />
                          {item.label}
                        </Link>
                      );
                    }),
                  )}
                </div>
              )}

              <Link
                to="/ai"
                onClick={closeMenus}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                <Sparkles size={16} />
                AI
              </Link>

              {!loading &&
                (user ? (
                  <>
                    <Link
                      to="/favorites"
                      onClick={closeMenus}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium"
                      style={{
                        color: "var(--text-primary)",
                      }}
                    >
                      <Heart size={16} />
                      Favorites
                    </Link>

                    <Link
                      to="/profile"
                      onClick={closeMenus}
                      className="mt-2 flex items-center gap-3 border-t px-3 pt-3 text-sm font-medium"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`/avatars/${avatarId}.svg`}
                          alt={user.name}
                        />
                        <AvatarFallback
                          style={{
                            backgroundColor:
                              "var(--primary)",
                            color: "white",
                          }}
                        >
                          {user.name
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <span className="flex-1">
                        Profile
                      </span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-2 w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium"
                      style={{
                        color: "var(--primary)",
                      }}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <div
                    className="mt-2 grid grid-cols-2 gap-2 border-t pt-3"
                    style={{
                      borderColor: "var(--border)",
                    }}
                  >
                    <Link
                      to="/signin"
                      onClick={closeMenus}
                      className="flex items-center justify-center rounded-md border px-3 py-2.5 text-sm font-medium"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                    >
                      Sign in
                    </Link>

                    <Link
                      to="/signin"
                      onClick={closeMenus}
                      className="flex items-center justify-center rounded-md px-3 py-2.5 text-sm font-semibold text-white"
                      style={{
                        backgroundColor: "var(--primary)",
                      }}
                    >
                      Get Started
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}