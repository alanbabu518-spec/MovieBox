import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

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

import { useLibraryStore } from "./store/library.store";
import { useThemeStore } from "./store/theme.store";

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, search]);

  return null;
}

/** Loads the user's favorites + watchlist once so every card shows the right state */
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

/** Keeps the browser / status-bar colour in step with the app theme */
function ThemeColorSync() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#08080b" : "#f6f6f8");
  }, [theme]);

  return null;
}

function GlobalAIChatbot() {
  const { pathname } = useLocation();

  const authPages = ["/signin", "/auth/verify"];

  if (authPages.includes(pathname)) {
    return null;
  }

  return <MovieAIChatbot />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <LibrarySync />
        <ThemeColorSync />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/auth/verify" element={<AuthVerify />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/ai/search" element={<AISearch />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>

        <GlobalAIChatbot />
      </BrowserRouter>
    </AuthProvider>
  );
}