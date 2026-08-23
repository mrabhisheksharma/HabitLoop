import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";

// Bold & playful palette from design_guidelines.json
const lightColors = {
  surface: "#FAFAFA",
  onSurface: "#1A1D1E",
  surfaceSecondary: "#FFFFFF",
  onSurfaceSecondary: "#1A1D1E",
  surfaceTertiary: "#F0F0F5",
  onSurfaceTertiary: "#686D73",
  surfaceInverse: "#1A1D1E",
  onSurfaceInverse: "#FAFAFA",
  brand: "#00D084",
  brandPrimary: "#00D084",
  onBrandPrimary: "#053321",
  brandSecondary: "#00C2FF",
  onBrandSecondary: "#003647",
  brandTertiary: "#E5FAF2",
  onBrandTertiary: "#00A669",
  success: "#00D084",
  onSuccess: "#053321",
  warning: "#FFB320",
  onWarning: "#4D3400",
  error: "#FF6B6B",
  onError: "#4D1111",
  info: "#00C2FF",
  onInfo: "#003647",
  border: "#E8EAEF",
  borderStrong: "#D0D4DD",
  divider: "#F0F0F5",
  // heatmap tiers (missed -> completed)
  heat0: "#F0F0F5",
  heat1: "#B9F0DC",
  heat2: "#6FE0B8",
  heat3: "#00D084",
};

const darkColors: typeof lightColors = {
  surface: "#121415",
  onSurface: "#F5F6F7",
  surfaceSecondary: "#1C1F21",
  onSurfaceSecondary: "#F5F6F7",
  surfaceTertiary: "#282C2F",
  onSurfaceTertiary: "#9BA1A6",
  surfaceInverse: "#F5F6F7",
  onSurfaceInverse: "#121415",
  brand: "#00E691",
  brandPrimary: "#00E691",
  onBrandPrimary: "#053321",
  brandSecondary: "#33CCFF",
  onBrandSecondary: "#002838",
  brandTertiary: "#113826",
  onBrandTertiary: "#00E691",
  success: "#00E691",
  onSuccess: "#053321",
  warning: "#FFC44D",
  onWarning: "#332200",
  error: "#FF8585",
  onError: "#4D1111",
  info: "#33CCFF",
  onInfo: "#002838",
  border: "#282C2F",
  borderStrong: "#3A3F43",
  divider: "#282C2F",
  heat0: "#282C2F",
  heat1: "#13503A",
  heat2: "#01885A",
  heat3: "#00E691",
};

export type Colors = typeof lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const fonts = {
  displayMedium: "Figtree-Medium",
  displaySemiBold: "Figtree-SemiBold",
  displayBold: "Figtree-Bold",
  displayExtraBold: "Figtree-ExtraBold",
  regular: "Nunito-Regular",
  semiBold: "Nunito-SemiBold",
  bold: "Nunito-Bold",
  extraBold: "Nunito-ExtraBold",
} as const;

type ThemeContextValue = { colors: Colors; isDark: boolean };

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const value = useMemo(
    () => ({ colors: isDark ? darkColors : lightColors, isDark }),
    [isDark],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
