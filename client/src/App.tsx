import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./shared/context/AuthContext";
import MovieAIChatbot from "./shared/components/ai/MovieAIChatbot";
import ErrorPage from "./shared/components/errors/ErrorPage";
import ErrorBoundary from "./shared/components/errors/ErrorBoundary";

import { useLibraryStore } from "./store/library.store";
import { useThemeStore } from "./store/theme.store";

// Lazy-loaded pages: downloaded when a route needs them.
const Home = lazy(() => import("./pages/Home"));
const Movies = lazy(() => import("./pages/Movies"));
const MovieDetails = lazy(() => import("./pages/MovieDetails"));
const SignIn = lazy(() => import("./pages/Authentication"));
const AuthVerify = lazy(() => import("./pages/AuthVerify"));
const Profile = lazy(() => import("./pages/Profile"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const Favorites = lazy(() => import("./pages/Favorites"));
const AISearch = lazy(() => import("./pages/AISearch"));

function PageLoader() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
        <p className="text-sm text-gray-500">Loading page...</p>
      </div>
    </div>
  );
}

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
 * Updates browser theme-color metadata when the theme changes.
 */
function ThemeColorSync() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#08080b" : "#f6f6f8");
  }, [theme]);

  return null;
}

/**
 * Shows the global AI chatbot on supported application pages.
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
 * Redirects older movie-detail URLs to the current route.
 */
function LegacyMovieRedirect() {
  const { id } = useParams();

  if (!id) {
    return <Navigate to="/movies" replace />;
  }

  return <Navigate to={`/movie/${encodeURIComponent(id)}`} replace />;
}

function RoutedApplication() {
  const { pathname } = useLocation();

  return (
    <ErrorBoundary key={pathname}>
      <ScrollToTop />
      <LibrarySync />
      <ThemeColorSync />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />

          <Route path="/movie/:id" element={<MovieDetails />} />

          <Route path="/movies/:id" element={<LegacyMovieRedirect />} />

          <Route path="/signin" element={<SignIn />} />
          <Route path="/auth/verify" element={<AuthVerify />} />

          <Route path="/watchlist" element={<Watchlist />} />

          <Route path="/favorites" element={<Favorites />} />

          <Route path="/ai/search" element={<AISearch />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="*" element={<ErrorPage statusCode={404} />} />
        </Routes>
      </Suspense>

      <GlobalAIChatbot />
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RoutedApplication />
      </BrowserRouter>
    </AuthProvider>
  );
}
