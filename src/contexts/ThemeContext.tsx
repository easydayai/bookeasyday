import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>("light");
  const [userOverride, setUserOverride] = useState<Theme | null>(null);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Handle auth state changes
  useEffect(() => {
    if (user) {
      // User is logged in - use override if set, otherwise default to dark
      setThemeState(userOverride ?? "dark");
    } else {
      // User logged out - revert to light and clear override
      setThemeState("light");
      setUserOverride(null);
    }
  }, [user, userOverride]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    if (user) {
      // Store user preference during session
      setUserOverride(newTheme);
    }
    setThemeState(newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    if (user) {
      setUserOverride(newTheme);
    }
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
