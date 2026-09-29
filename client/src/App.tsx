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
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function ScrollToTop() {
  const { pathname, search } =
    useLocation();

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
          path="/signup"
          element={<SignUp />}
        />

        <Route
          path="/verifyotp"
          element={<VerifyOtp />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />
      </Routes>
    </BrowserRouter>
  );
}