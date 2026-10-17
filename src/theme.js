/**
 * Theme configuration and manager
 * Default theme: 'dark' (matches reference designs)
 * Switchable to 'light'
 */

export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
};

// Change this value or call setTheme() to switch themes
export let activeTheme = THEMES.DARK;

/**
 * Apply theme to document element
 * @param {'dark' | 'light'} theme
 */
export function applyTheme(theme = activeTheme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === THEMES.LIGHT) {
      document.documentElement.classList.add('theme-light');
      document.documentElement.classList.remove('theme-dark');
    } else {
      document.documentElement.classList.add('theme-dark');
      document.documentElement.classList.remove('theme-light');
    }
  }
}

/**
 * Set and activate a theme
 * @param {'dark' | 'light'} theme
 */
export function setTheme(theme) {
  activeTheme = theme === THEMES.LIGHT ? THEMES.LIGHT : THEMES.DARK;
  applyTheme(activeTheme);
  return activeTheme;
}

/**
 * Toggle between dark and light themes
 */
export function toggleTheme() {
  return setTheme(activeTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK);
}

/**
 * Get currently active theme
 */
export function getTheme() {
  return activeTheme;
}

// Automatically initialize theme on load
applyTheme(activeTheme);
