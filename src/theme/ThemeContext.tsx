import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

export const lightColors = {
  surface: "#F8FAFC",
  onSurface: "#0F172A",
  surfaceSecondary: "#FFFFFF",
  onSurfaceSecondary: "#0F172A",
  surfaceTertiary: "#F1F5F9",
  onSurfaceTertiary: "#64748B",
  surfaceInverse: "#0F172A",
  onSurfaceInverse: "#F8FAFC",
  brand: "#6366F1",
  brandPrimary: "#4F46E5",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#8B5CF6",
  onBrandSecondary: "#FFFFFF",
  brandTertiary: "#EEF2FF",
  onBrandTertiary: "#4338CA",
  success: "#6366F1",
  onSuccess: "#FFFFFF",
  warning: "#F59E0B",
  onWarning: "#78350F",
  error: "#EF4444",
  onError: "#7F1D1D",
  info: "#0EA5E9",
  onInfo: "#0369A1",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  divider: "#F1F5F9",
  heat0: "#E2E8F0",
  heat1: "#C7D2FE",
  heat2: "#818CF8",
  heat3: "#4F46E5",
};

export const darkColors: typeof lightColors = {
  surface: "#0B0F17",
  onSurface: "#F8FAFC",
  surfaceSecondary: "#1E293B",
  onSurfaceSecondary: "#F8FAFC",
  surfaceTertiary: "#334155",
  onSurfaceTertiary: "#94A3B8",
  surfaceInverse: "#F8FAFC",
  onSurfaceInverse: "#0B0F17",
  brand: "#818CF8",
  brandPrimary: "#6366F1",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#A78BFA",
  onBrandSecondary: "#FFFFFF",
  brandTertiary: "#312E81",
  onBrandTertiary: "#C7D2FE",
  success: "#818CF8",
  onSuccess: "#1E1B4B",
  warning: "#FBBF24",
  onWarning: "#78350F",
  error: "#F87171",
  onError: "#7F1D1D",
  info: "#38BDF8",
  onInfo: "#075985",
  border: "#334155",
  borderStrong: "#475569",
  divider: "#1E293B",
  heat0: "#1E293B",
  heat1: "#312E81",
  heat2: "#4F46E5",
  heat3: "#818CF8",
};

export type Colors = typeof lightColors;

interface ThemeContextType {
  isDark: boolean;
  colors: Colors;
  toggleTheme: () => void;
  setThemeMode: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("habitloop_theme");
      if (saved) return saved === "dark";
      return false; // Strict light mode default
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
    try {
      localStorage.setItem("habitloop_theme", isDark ? "dark" : "light");
    } catch {}
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);
  const setThemeMode = (dark: boolean) => setIsDark(dark);
  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
