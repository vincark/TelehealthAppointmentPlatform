import { useState, useEffect } from 'react';

/**
 * Custom hook to manage light/dark theme.
 * 
 * - Reads saved theme from localStorage on first load
 * - Falls back to user's OS preference (prefers-color-scheme)
 * - Defaults to 'light' if neither is set
 * - Saves changes to localStorage so it persists across page loads
 * - Updates <html data-theme="..."> so CSS can react
 *
 * Usage:
 *   const { theme, toggleTheme } = useTheme();
 *   <button onClick={toggleTheme}>switch</button>
 */
export function useTheme() {
  // 1. Pick the initial theme on first load
  const [theme, setTheme] = useState(() => {
    // Has the user saved a preference before?
    const saved = localStorage.getItem('telehealth-theme');
    if (saved === 'light' || saved === 'dark') return saved;

    // Fall back to OS preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // Default
    return 'light';
  });

  // 2. Whenever theme changes, update the <html> tag and save it
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('telehealth-theme', theme);
  }, [theme]);

  // 3. Return the current theme + a function to flip it
  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
}