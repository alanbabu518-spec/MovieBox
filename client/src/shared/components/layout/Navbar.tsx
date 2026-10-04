import {
  Bookmark,
  ChevronDown,
  Clock3,
  Film,
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
import { Link, useNavigate } from "react-router-dom";

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
  requiresAuth?: boolean;
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
        requiresAuth: true,
      },
      {
        label: "Trending",
        description: "What's hot right now",
        icon: TrendingUp,
        href: "/movies",
        requiresAuth: true,
      },
      {
        label: "Upcoming",
        description: "Movies coming soon",
        icon: Clock3,
        href: "/movies",
        requiresAuth: true,
      },
      {
        label: "New Releases",
        description: "Recently released movies",
        icon: Film,
        href: "/movies",
        requiresAuth: true,
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
        href: "/movies",
        requiresAuth: true,
      },
      {
        label: "Genres",
        description: "Browse movies by genre",
        icon: Sparkles,
        href: "/movies",
        requiresAuth: true,
      },
      {
        label: "Top Rated",
        description: "Highly rated movies",
        icon: Star,
        href: "/movies",
        requiresAuth: true,
      },
    ],
  },
];

const collectionSections: DropdownSection[] = [
  {
    title: "Your Collection",
    items: [
      {
        label: "Watchlist",
        description: "Movies you want to watch",
        icon: Bookmark,
        href: "/watchlist",
        requiresAuth: true,
      },
      {
        label: "Favorites",
        description: "Your favorite movies",
        icon: Heart,
        href: "/favorites",
        requiresAuth: true,
      },
      {
        label: "History",
        description: "Recently watched movies",
        icon: History,
        href: "/profile",
        requiresAuth: true,
      },
    ],
  },
];

const aiSections: DropdownSection[] = [
  {
    title: "Movie AI",
    items: [
      {
        label: "AI Assistant",
        description: "Ask anything about movies",
        icon: Sparkles,
        href: "/ai",
        requiresAuth: true,
      },
      {
        label: "AI Recommendations",
        description: "Get personalized movie ideas",
        icon: Star,
        href: "/ai",
        requiresAuth: true,
      },
      {
        label: "AI Search",
        description: "Describe the movie you want",
        icon: Search,
        href: "/ai",
        requiresAuth: true,
      },
    ],
  },
];

function DropdownMenu({
  sections,
  open,
  onNavigate,
}: {
  sections: DropdownSection[];
  open: boolean;
  onNavigate: (href: string, requiresAuth?: boolean) => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="absolute left-0 top-full pt-2">
      <div
        className="w-max min-w-70 rounded-2xl border p-3 shadow-2xl"
        style={{
          backgroundColor: "var(--background)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex gap-6">
          {sections.map((section) => (
            <div key={section.title} className="min-w-70">
              <p
                className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.15em]"
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
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => onNavigate(item.href, item.requiresAuth)}
                      className="group flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 group-hover:scale-105"
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
                    </button>
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

function MobileDropdownItems({
  sections,
  onNavigate,
}: {
  sections: DropdownSection[];
  onNavigate: (href: string, requiresAuth?: boolean) => void;
}) {
  return (
    <div className="mb-1 ml-3 border-l pl-3">
      {sections.flatMap((section) =>
        section.items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate(item.href, item.requiresAuth)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              <Icon size={15} />
              {item.label}
            </button>
          );
        }),
      )}
    </div>
  );
}

export default function Navbar() {
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [mobileOpen, setMobileOpen] = useState(false);

  const [mobileMovieOpen, setMobileMovieOpen] = useState(false);

  const [mobileDiscoverOpen, setMobileDiscoverOpen] = useState(false);

  const [mobileCollectionOpen, setMobileCollectionOpen] = useState(false);

  const [mobileAIOpen, setMobileAIOpen] = useState(false);

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
    setMobileCollectionOpen(false);
    setMobileAIOpen(false);
  };

  const handleNavigation = (href: string, requiresAuth = false) => {
    closeMenus();

    if (requiresAuth && !user) {
      navigate("/signin");
      return;
    }

    navigate(href);
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

  const avatarNumber = Number(avatarId.replace("avatar-", ""));

  const avatarSrc =
    avatarId === "avatar-1" ||
    !Number.isInteger(avatarNumber) ||
    avatarNumber < 2 ||
    avatarNumber > 10
      ? null
      : `/avatars/avatar${avatarNumber - 1}.svg`;

  const avatarFallback = user?.name?.trim().charAt(0).toUpperCase() || "U";

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
        className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--background) 90%, transparent)",
          borderColor: "var(--border)",
        }}
      >
        <nav
          className="
            mx-auto
            flex
            h-14
            max-w-7xl
            items-center
            justify-between
            px-4
            sm:px-6
            lg:px-8
          "
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
              className="
                -ml-2
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                transition-colors
                hover:bg-black/5
                dark:hover:bg-white/10
                md:hidden
              "
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

            <Link
              to="/"
              onClick={closeMenus}
              className="group flex shrink-0 items-center gap-2"
            >
              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  transition-transform
                  duration-200
                  group-hover:scale-105
                "
                style={{
                  backgroundColor: "var(--primary)",
                }}
              >
                <span className="font-display text-base font-bold text-white">
                  M
                </span>
              </div>

              <span
                className="
                  font-display
                  text-lg
                  font-bold
                  tracking-tight
                "
                style={{
                  color: "var(--text-primary)",
                }}
              >
                MOVIE
                <span
                  style={{
                    color: "var(--primary)",
                  }}
                >
                  BOX
                </span>
              </span>
            </Link>
          </div>

          <div
            className="
              hidden
              h-full
              items-center
              md:flex
            "
          >
            <Link
              to="/"
              className="
                flex
                h-full
                items-center
                px-3
                text-sm
                font-medium
                transition-colors
                hover:text-(--primary)]
              "
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
                className="
                  group
                  flex
                  h-full
                  items-center
                  gap-1
                  px-3
                  text-sm
                  font-medium
                "
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
                onNavigate={handleNavigation}
              />
            </div>

            <div
              className="relative h-full"
              onMouseEnter={() => setOpenMenu("discover")}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button
                type="button"
                className="
                  group
                  flex
                  h-full
                  items-center
                  gap-1
                  px-3
                  text-sm
                  font-medium
                "
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
                onNavigate={handleNavigation}
              />
            </div>

            <div
              className="relative h-full"
              onMouseEnter={() => setOpenMenu("collections")}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button
                type="button"
                className="
                  group
                  flex
                  h-full
                  items-center
                  gap-1
                  px-3
                  text-sm
                  font-medium
                "
                style={{
                  color:
                    openMenu === "collections"
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                }}
              >
                Collections
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    openMenu === "collections" ? "rotate-180" : ""
                  }`}
                />
              </button>

              <DropdownMenu
                sections={collectionSections}
                open={openMenu === "collections"}
                onNavigate={handleNavigation}
              />
            </div>

            <div
              className="relative h-full"
              onMouseEnter={() => setOpenMenu("ai")}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button
                type="button"
                className="
                  flex
                  h-full
                  items-center
                  gap-1.5
                  px-3
                  text-sm
                  font-medium
                "
                style={{
                  color:
                    openMenu === "ai"
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: "var(--primary)",
                  }}
                />
                AI
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    openMenu === "ai" ? "rotate-180" : ""
                  }`}
                />
              </button>

              <DropdownMenu
                sections={aiSections}
                open={openMenu === "ai"}
                onNavigate={handleNavigation}
              />
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              aria-label="Search movies"
              onClick={() => handleNavigation("/movies", true)}
              className="
                hidden
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                transition-all
                duration-200
                hover:scale-105
                hover:bg-black/5
                dark:hover:bg-white/10
                md:flex
              "
              style={{
                color: "var(--text-secondary)",
              }}
            >
              <Search size={18} strokeWidth={1.8} />
            </button>

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
              className="
                relative
                flex
                h-9
                w-9
                items-center
                justify-center
                overflow-hidden
                rounded-full
                transition-transform
                duration-200
                hover:scale-110
                hover:bg-black/5
                dark:hover:bg-white/10
              "
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

            {!loading && user && (
              <>
                <Link
                  to="/favorites"
                  aria-label="Favorites"
                  className="
                    hidden
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    transition-colors
                    hover:bg-black/5
                    dark:hover:bg-white/10
                    sm:flex
                  "
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  <Heart size={18} strokeWidth={1.8} />
                </Link>

                <Link
                  to="/profile"
                  aria-label="Profile"
                  className="
                    ml-1
                    hidden
                    sm:flex
                  "
                >
                  <Avatar
                    className="
                      h-8
                      w-8
                      transition-opacity
                      hover:opacity-90
                    "
                  >
                    {avatarSrc && (
                      <AvatarImage src={avatarSrc} alt={user.name} />
                    )}

                    <AvatarFallback
                      style={{
                        backgroundColor: "var(--primary)",
                        color: "white",
                      }}
                    >
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </>
            )}

            {!loading && !user && (
              <Link
                to="/signin"
                className="
                  ml-1
                  hidden
                  rounded-md
                  px-3.5
                  py-1.5
                  text-sm
                  font-semibold
                  text-white
                  transition-opacity
                  hover:opacity-90
                  sm:block
                "
                style={{
                  backgroundColor: "var(--primary)",
                }}
              >
                Get Started
              </Link>
            )}

            {!loading && !user && (
              <Link
                to="/signin"
                onClick={closeMenus}
                className="
                  ml-1
                  flex
                  items-center
                  rounded-lg
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  text-white
                  transition-all
                  duration-200
                  hover:opacity-90
                  active:scale-95
                  md:hidden
                "
                style={{
                  backgroundColor: "var(--primary)",
                }}
              >
                Get Started
              </Link>
            )}

            {!loading && user && (
              <Link
                to="/profile"
                aria-label="Profile"
                className="
                  ml-1
                  flex
                  md:hidden
                "
              >
                <Avatar
                  className="
                    h-8
                    w-8
                    transition-opacity
                    hover:opacity-90
                  "
                >
                  {avatarSrc && <AvatarImage src={avatarSrc} alt={user.name} />}

                  <AvatarFallback
                    style={{
                      backgroundColor: "var(--primary)",
                      color: "white",
                    }}
                  >
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}
          </div>
        </nav>

        {mobileOpen && (
          <div
            className="
              max-h-[calc(100vh-3.5rem)]
              overflow-y-auto
              border-t
              md:hidden
            "
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="
                mx-auto
                max-w-7xl
                px-4
                py-3
                sm:px-6
              "
            >
              <Link
                to="/"
                onClick={closeMenus}
                className="
                  block
                  rounded-lg
                  px-3
                  py-2.5
                  text-sm
                  font-medium
                  transition-colors
                  hover:bg-black/5
                  dark:hover:bg-white/5
                "
                style={{
                  color: "var(--text-primary)",
                }}
              >
                Home
              </Link>

              <button
                type="button"
                onClick={() => setMobileMovieOpen((open) => !open)}
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-lg
                  px-3
                  py-2.5
                  text-sm
                  font-medium
                  transition-colors
                  hover:bg-black/5
                  dark:hover:bg-white/5
                "
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
                <MobileDropdownItems
                  sections={movieSections}
                  onNavigate={handleNavigation}
                />
              )}

              <button
                type="button"
                onClick={() => setMobileDiscoverOpen((open) => !open)}
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-lg
                  px-3
                  py-2.5
                  text-sm
                  font-medium
                  transition-colors
                  hover:bg-black/5
                  dark:hover:bg-white/5
                "
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
                <MobileDropdownItems
                  sections={discoverSections}
                  onNavigate={handleNavigation}
                />
              )}

              <button
                type="button"
                onClick={() => setMobileCollectionOpen((open) => !open)}
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-lg
                  px-3
                  py-2.5
                  text-sm
                  font-medium
                  transition-colors
                  hover:bg-black/5
                  dark:hover:bg-white/5
                "
                style={{
                  color: "var(--text-primary)",
                }}
              >
                Collections
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    mobileCollectionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileCollectionOpen && (
                <MobileDropdownItems
                  sections={collectionSections}
                  onNavigate={handleNavigation}
                />
              )}

              <button
                type="button"
                onClick={() => setMobileAIOpen((open) => !open)}
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-lg
                  px-3
                  py-2.5
                  text-sm
                  font-medium
                  transition-colors
                  hover:bg-black/5
                  dark:hover:bg-white/5
                "
                style={{
                  color: "var(--text-primary)",
                }}
              >
                <span className="flex items-center gap-2">
                  <Sparkles size={16} />
                  AI
                </span>

                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    mobileAIOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileAIOpen && (
                <MobileDropdownItems
                  sections={aiSections}
                  onNavigate={handleNavigation}
                />
              )}

              <button
                type="button"
                onClick={() => handleNavigation("/movies", true)}
                className="
                  mt-1
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-lg
                  px-3
                  py-2.5
                  text-left
                  text-sm
                  font-medium
                  transition-colors
                  hover:bg-black/5
                  dark:hover:bg-white/5
                "
                style={{
                  color: "var(--text-primary)",
                }}
              >
                <Search size={17} />
                Search Movies
              </button>

              {!loading && user && (
                <>
                  <Link
                    to="/favorites"
                    onClick={closeMenus}
                    className="
                      mt-1
                      flex
                      items-center
                      gap-2
                      rounded-lg
                      px-3
                      py-2.5
                      text-sm
                      font-medium
                      transition-colors
                      hover:bg-black/5
                      dark:hover:bg-white/5
                    "
                    style={{
                      color: "var(--text-primary)",
                    }}
                  >
                    <Heart size={16} />
                    Favorites
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      mt-2
                      w-full
                      rounded-lg
                      px-3
                      py-2.5
                      text-left
                      text-sm
                      font-medium
                    "
                    style={{
                      color: "var(--primary)",
                    }}
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <div className="h-14" aria-hidden="true" />
    </>
  );
}
