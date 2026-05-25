import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeContext = {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const THEME_KEY = "atlas_theme";
const ThemeCtx = createContext<ThemeContext | null>(null);

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const setTheme = (nextTheme: Theme) => setThemeState(nextTheme);

  return (
    <ThemeCtx.Provider
      value={{
        theme,
        isDark: theme === "dark",
        setTheme,
        toggleTheme: () => setThemeState((current) => (current === "dark" ? "light" : "dark")),
      }}
    >
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeCtx);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
