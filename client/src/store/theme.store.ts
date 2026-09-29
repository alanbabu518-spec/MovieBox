import { create } from "zustand";

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "dark";
  }

  const savedTheme = localStorage.getItem("moviebox-theme");

  const theme: Theme =
    savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : "dark";

  document.documentElement.setAttribute(
    "data-theme",
    theme
  );

  return theme;
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),

  toggleTheme: () => {
    set((state) => {
      const newTheme: Theme =
        state.theme === "dark" ? "light" : "dark";

      localStorage.setItem(
        "moviebox-theme",
        newTheme
      );

      document.documentElement.setAttribute(
        "data-theme",
        newTheme
      );

      return {
        theme: newTheme,
      };
    });
  },
}));