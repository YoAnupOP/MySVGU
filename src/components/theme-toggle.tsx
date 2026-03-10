"use client";

import { useEffect, useState } from "react";
import { Moon, SunMedium } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppTheme, getResolvedTheme, THEME_STORAGE_KEY } from "@/lib/theme";

function applyTheme(nextTheme: AppTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", nextTheme === "dark");
  root.dataset.theme = nextTheme;
}

export default function ThemeToggle({
  className,
  iconOnly = false,
}: {
  className?: string;
  iconOnly?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<AppTheme>("light");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as AppTheme | null;
    const resolvedTheme = getResolvedTheme(storedTheme, mediaQuery.matches);

    applyTheme(resolvedTheme);
    setTheme(resolvedTheme);
    setMounted(true);

    const onChange = (event: MediaQueryListEvent) => {
      const latestStoredTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as AppTheme | null;
      if (latestStoredTheme) {
        return;
      }

      const nextTheme = event.matches ? "dark" : "light";
      applyTheme(nextTheme);
      setTheme(nextTheme);
    };

    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme: AppTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="outline"
        size={iconOnly ? "icon" : "default"}
        className={className}
        disabled
      >
        <Moon className="h-4 w-4" />
        {iconOnly ? <span className="sr-only">Toggle theme</span> : <span>Theme</span>}
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size={iconOnly ? "icon" : "default"}
      className={className}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {iconOnly ? <span className="sr-only">Toggle theme</span> : <span>{isDark ? "Light mode" : "Dark mode"}</span>}
    </Button>
  );
}
