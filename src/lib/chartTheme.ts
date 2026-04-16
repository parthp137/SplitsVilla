import { useEffect, useState } from "react";

export interface ChartTheme {
  backgroundColor: string;
  textColor: string;
  gridColor: string;
  primaryColor: string;
  secondaryColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  neutralColors: string[];
}

/**
 * Get theme-aware colors for charts
 * Automatically adjusts colors based on light/dark mode
 */
export function getChartTheme(): ChartTheme {
  const isDark = document.documentElement.classList.contains("dark");

  if (isDark) {
    return {
      backgroundColor: "rgb(9, 9, 11)", // bg-background
      textColor: "rgb(228, 228, 231)", // text-foreground
      gridColor: "rgb(39, 39, 42)", // muted grid colors
      primaryColor: "rgb(249, 115, 22)", // primary orange
      secondaryColor: "rgb(250, 204, 21)", // secondary yellow
      successColor: "rgb(34, 197, 94)", // green
      warningColor: "rgb(251, 146, 60)", // warning orange
      errorColor: "rgb(239, 68, 68)", // red
      neutralColors: [
        "rgb(168, 85, 247)", // purple
        "rgb(59, 130, 246)", // blue
        "rgb(34, 197, 94)", // green
        "rgb(249, 115, 22)", // orange
        "rgb(239, 68, 68)", // red
      ],
    };
  }

  return {
    backgroundColor: "rgb(255, 255, 255)",
    textColor: "rgb(24, 24, 27)",
    gridColor: "rgb(229, 231, 235)",
    primaryColor: "rgb(249, 115, 22)",
    secondaryColor: "rgb(250, 204, 21)",
    successColor: "rgb(34, 197, 94)",
    warningColor: "rgb(251, 146, 60)",
    errorColor: "rgb(239, 68, 68)",
    neutralColors: [
      "rgb(168, 85, 247)",
      "rgb(59, 130, 246)",
      "rgb(34, 197, 94)",
      "rgb(249, 115, 22)",
      "rgb(239, 68, 68)",
    ],
  };
}

/**
 * Hook to get theme and listen for changes
 */
export function useChartTheme() {
  const [theme, setTheme] = useState<ChartTheme>(getChartTheme());

  useEffect(() => {
    // Get initial theme
    setTheme(getChartTheme());

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      setTheme(getChartTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}

/**
 * Recharts theme configuration for light mode
 */
export const RECHARTS_LIGHT_THEME = {
  backgroundColor: "#ffffff",
  textColor: "#000000",
  cartesianAxis: {
    strokeColor: "#ccc",
  },
  contentStyle: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },
  labelStyle: {
    color: "#000000",
  },
};

/**
 * Recharts theme configuration for dark mode
 */
export const RECHARTS_DARK_THEME = {
  backgroundColor: "#09090b",
  textColor: "#e4e4e7",
  cartesianAxis: {
    strokeColor: "#27272a",
  },
  contentStyle: {
    backgroundColor: "#18181b",
    border: "1px solid #27272a",
    borderRadius: "8px",
  },
  labelStyle: {
    color: "#e4e4e7",
  },
};

/**
 * Get Recharts theme based on current mode
 */
export function getRechartsTheme() {
  const isDark = document.documentElement.classList.contains("dark");
  return isDark ? RECHARTS_DARK_THEME : RECHARTS_LIGHT_THEME;
}

/**
 * Hook for Recharts theme with updates on mode change
 */
export function useRechartsTheme() {
  const [rechartsTheme, setRechartsTheme] = useState(getRechartsTheme());

  useEffect(() => {
    setRechartsTheme(getRechartsTheme());

    const observer = new MutationObserver(() => {
      setRechartsTheme(getRechartsTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return rechartsTheme;
}

/**
 * Chart color palettes for different chart types
 */
export const CHART_PALETTES = {
  // For pie/donut charts
  categorical: (isDark: boolean) => (
    isDark
      ? ["rgb(249, 115, 22)", "rgb(250, 204, 21)", "rgb(59, 130, 246)", "rgb(168, 85, 247)", "rgb(239, 68, 68)"]
      : ["rgb(249, 115, 22)", "rgb(250, 204, 21)", "rgb(59, 130, 246)", "rgb(168, 85, 247)", "rgb(239, 68, 68)"]
  ),

  // For sequential data (e.g., temperature)
  sequential: (isDark: boolean) => (
    isDark
      ? ["rgb(30, 41, 59)", "rgb(59, 130, 246)", "rgb(34, 197, 94)", "rgb(250, 204, 21)", "rgb(239, 68, 68)"]
      : ["rgb(226, 232, 240)", "rgb(147, 197, 253)", "rgb(134, 239, 172)", "rgb(254, 240, 138)", "rgb(248, 113, 113)"]
  ),

  // For diverging data (e.g., sentiment)
  diverging: (isDark: boolean) => (
    isDark
      ? ["rgb(239, 68, 68)", "rgb(249, 115, 22)", "rgb(148, 163, 184)", "rgb(59, 130, 246)", "rgb(34, 197, 94)"]
      : ["rgb(248, 113, 113)", "rgb(252, 165, 11)", "rgb(203, 213, 225)", "rgb(96, 165, 250)", "rgb(74, 222, 128)"]
  ),
};

export default getChartTheme;
