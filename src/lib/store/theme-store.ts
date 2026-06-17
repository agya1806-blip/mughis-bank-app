"use client";

import { create } from "zustand";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (theme: Theme) => void;
  init: () => void;
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") return getSystemTheme();
  return theme;
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "system",
  resolved: "light",

  setTheme: (theme) => {
    const resolved = resolveTheme(theme);
    applyTheme(resolved);
    set({ theme, resolved });
    if (typeof window !== "undefined") {
      localStorage.setItem("mughis-theme", theme);
    }
  },

  init: () => {
    const stored = (typeof window !== "undefined"
      ? localStorage.getItem("mughis-theme")
      : null) as Theme | null;
    const theme = stored || "system";
    const resolved = resolveTheme(theme);
    applyTheme(resolved);
    set({ theme, resolved });

    if (typeof window !== "undefined") {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (get().theme === "system") {
          const newResolved = getSystemTheme();
          applyTheme(newResolved);
          set({ resolved: newResolved });
        }
      });
    }
  },
}));
