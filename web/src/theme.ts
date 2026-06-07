/**
 * Dark/light theme management with localStorage persistence.
 * Defaults to system preference via `prefers-color-scheme`.
 * @module theme
 */

const STORAGE_KEY = "qkd-theme";

/** Initializes theme from localStorage or system preference. */
export function initTheme(): void {
  const stored = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = stored ? stored === "dark" : prefersDark;
  applyTheme(dark);
}

/** Toggles between dark and light mode, persisting the choice. */
export function toggleTheme(): void {
  const dark = !document.documentElement.classList.contains("dark");
  applyTheme(dark);
  localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
}

/** Returns whether dark mode is currently active. */
export function isDark(): boolean {
  return document.documentElement.classList.contains("dark");
}

/**
 * Applies the theme class and dispatches a `theme-changed` event.
 * @param dark - Whether to enable dark mode.
 */
function applyTheme(dark: boolean): void {
  document.documentElement.classList.toggle("dark", dark);
  window.dispatchEvent(new CustomEvent("theme-changed", { detail: { dark } }));
}
