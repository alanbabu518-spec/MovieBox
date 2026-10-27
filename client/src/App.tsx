import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";

import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import SignIn from "./pages/Authentication";
import AuthVerify from "./pages/AuthVerify";
import Profile from "./pages/Profile";
import Watchlist from "./pages/Watchlist";
import Favorites from "./pages/Favorites";
import AISearch from "./pages/AISearch";

import { AuthProvider, useAuth } from "./shared/context/AuthContext";
import MovieAIChatbot from "./shared/components/ai/MovieAIChatbot";
import ErrorPage from "./shared/components/errors/ErrorPage";
import ErrorBoundary from "./shared/components/errors/ErrorBoundary";

import { useLibraryStore } from "./store/library.store";
import { useThemeStore } from "./store/theme.store";

/**
 * Scrolls to the top whenever the user navigates to a new page
 * or changes the query string.
 */
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname, search]);

  return null;
}

/**
 * Loads the authenticated user's favorites and watchlist.
 * Clears user-specific library data when the user signs out.
 */
function LibrarySync() {
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    const library = useLibraryStore.getState();

    if (userId) {
      void library.load();
    } else {
      library.reset();
    }
  }, [userId]);

  return null;
}

/**
 * Updates the browser's theme-color metadata when the theme changes.
 */
function ThemeColorSync() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        "content",
        theme === "dark" ? "#08080b" : "#f6f6f8",
      );
  }, [theme]);

  return null;
}

/**
 * Shows the global AI chatbot on supported application pages.
 * Hides it on authentication pages and unknown routes.
 */
function GlobalAIChatbot() {
  const { pathname } = useLocation();

  const hiddenPaths = ["/signin", "/auth/verify"];

  if (hiddenPaths.includes(pathname)) {
    return null;
  }

  const knownPaths = [
    "/",
    "/movies",
    "/signin",
    "/auth/verify",
    "/watchlist",
    "/favorites",
    "/ai/search",
    "/profile",
  ];

  const isKnownRoute =
    knownPaths.includes(pathname) ||
    /^\/movie\/[^/]+$/.test(pathname) ||
    /^\/movies\/[^/]+$/.test(pathname);

  if (!isKnownRoute) {
    return null;
  }

  return <MovieAIChatbot />;
}

/**
 * Maintains backward compatibility with older movie-detail links.
 *
 * Older URL: /movies/123
 * Current URL: /movie/123
 */
function LegacyMovieRedirect() {
  const { id } = useParams();

  if (!id) {
    return <Navigate to="/movies" replace />;
  }

  return (
    <Navigate
      to={`/movie/${encodeURIComponent(id)}`}
      replace
    />
  );
}

/**
 * Defines the routes and shared application components.
 */
function RoutedApplication() {
  const { pathname } = useLocation();

  return (
    <ErrorBoundary key={pathname}>
      <ScrollToTop />
      <LibrarySync />
      <ThemeColorSync />

      <Routes>
        {/* Main pages */}
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route
          path="/movie/:id"
          element={<MovieDetails />}
        />

        {/* Backward-compatible movie-detail route */}
        <Route
          path="/movies/:id"
          element={<LegacyMovieRedirect />}
        />

        {/* Authentication */}
        <Route path="/signin" element={<SignIn />} />
        <Route
          path="/auth/verify"
          element={<AuthVerify />}
        />

        {/* User library */}
        <Route
          path="/watchlist"
          element={<Watchlist />}
        />
        <Route
          path="/favorites"
          element={<Favorites />}
        />

        {/* AI and profile */}
        <Route
          path="/ai/search"
          element={<AISearch />}
        />
        <Route path="/profile" element={<Profile />} />

        {/* Keep the 404 route last */}
        <Route
          path="*"
          element={<ErrorPage statusCode={404} />}
        />
      </Routes>

      <GlobalAIChatbot />
    </ErrorBoundary>
  );
}

/**
 * Root application component.
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RoutedApplication />
      </BrowserRouter>
    </AuthProvider>
  );
}