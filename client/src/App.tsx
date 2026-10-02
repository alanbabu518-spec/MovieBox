import { useEffect } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
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

import { AuthProvider } from "./shared/context/AuthContext";
import MovieAIChatbot from "./shared/components/ai/MovieAIChatbot";

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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />

        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/movies"
            element={<Movies />}
          />

          <Route
            path="/movie/:id"
            element={<MovieDetails />}
          />

          <Route
            path="/signin"
            element={<SignIn />}
          />

          <Route
            path="/auth/verify"
            element={<AuthVerify />}
          />

          <Route
            path="/watchlist"
            element={<Watchlist />}
          />

          <Route
            path="/favorites"
            element={<Favorites />}
          />

          <Route
            path="/ai/search"
            element={<AISearch />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />
        </Routes>

        <MovieAIChatbot />
      </BrowserRouter>
    </AuthProvider>
  );
}