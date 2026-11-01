import { useCallback, useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'pokedex-theme';

function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'ultra' ? 'ultra' : 'pokeball';
  } catch {
    return 'pokeball';
  }
}

export default function useTheme() {
  // React state is the source of truth for the active palette and visible theme label.
  const [theme, setTheme] = useState(getSavedTheme);

  useEffect(() => {
    // A document attribute lets one set of CSS variables theme the entire application.
    document.documentElement.dataset.theme = theme;
    document.getElementById('theme-color')?.setAttribute('content', theme === 'ultra' ? '#121212' : '#F2F2F2');
    try {
      // Persist the small theme name so the selected palette survives a page refresh.
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage restrictions should not disable theme switching.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => currentTheme === 'pokeball' ? 'ultra' : 'pokeball');
  }, []);

  useEffect(() => {
    function handleThemeShortcut(event) {
      if (event.key.toLowerCase() !== 'n' || event.altKey || event.ctrlKey || event.metaKey) return;

      const target = event.target;
      const tagName = target?.tagName?.toLowerCase();
      const isEditable = target?.isContentEditable || target?.closest?.('[contenteditable="true"]');
      if (isEditable || ['input', 'textarea', 'select'].includes(tagName)) return;

      event.preventDefault();
      toggleTheme();
    }

    // Register once and remove the listener on unmount to avoid duplicate shortcuts.
    window.addEventListener('keydown', handleThemeShortcut);
    return () => window.removeEventListener('keydown', handleThemeShortcut);
  }, [toggleTheme]);

  return { theme, toggleTheme };
}
