import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isHomePage: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const [theme, setThemeState] = useState<Theme>("light");
  const [userOverride, setUserOverride] = useState<Theme | null>(null);

  const isHomePage = location.pathname === "/";

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // RULE: Home page is ALWAYS light mode, no exceptions
    if (isHomePage) {
      root.classList.remove("dark");
      return;
    }
    
    // For other pages, apply the current theme
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme, isHomePage]);

  // Handle auth state and route changes for theme
  useEffect(() => {
    // RULE: Home page is always light - don't change theme state here,
    // just let the effect above handle the DOM
    if (isHomePage) {
      return;
    }

    if (user) {
      // User is logged in - use override if set, otherwise default to dark
      setThemeState(userOverride ?? "dark");
    } else {
      // User logged out - revert to light and clear override
      setThemeState("light");
      setUserOverride(null);
    }
  }, [user, isHomePage]);

  // When user override changes (from toggle), update theme if not on home
  useEffect(() => {
    if (user && userOverride !== null && !isHomePage) {
      setThemeState(userOverride);
    }
  }, [userOverride, user, isHomePage]);

  const toggleTheme = () => {
    // Don't allow toggle on home page
    if (isHomePage) return;
    
    const newTheme = theme === "light" ? "dark" : "light";
    if (user) {
      // Store user preference during session
      setUserOverride(newTheme);
    }
    setThemeState(newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    // Don't allow setting theme on home page
    if (isHomePage) return;
    
    if (user) {
      setUserOverride(newTheme);
    }
    setThemeState(newTheme);
  };

  // Clear override on logout (handled by auth state change)
  useEffect(() => {
    if (!user) {
      setUserOverride(null);
      setThemeState("light");
    }
  }, [user]);

  return (
    <ThemeContext.Provider value={{ theme: isHomePage ? "light" : theme, toggleTheme, setTheme, isHomePage }}>
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
