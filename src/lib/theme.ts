export const THEME_STORAGE_KEY = "mysvgu-theme";
export type AppTheme = "light" | "dark";

export function getResolvedTheme(theme: AppTheme | null | undefined, prefersDark: boolean): AppTheme {
  if (theme === "light" || theme === "dark") {
    return theme;
  }

  return prefersDark ? "dark" : "light";
}
