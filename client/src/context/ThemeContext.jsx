import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {}, allowUserOverride: true, setTheme: () => {} });

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [allowUserOverride, setAllowUserOverride] = useState(true);
  const [loaded, setLoaded] = useState(false);

  // Load from backend global + user preference/localStorage
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/theme`);
        if (res.ok) {
          const data = await res.json();
          setAllowUserOverride(data.allowUserOverride);
          const stored = localStorage.getItem('theme');
          const base = data.defaultTheme || 'dark';
          const finalTheme = allowUserOverride && stored ? stored : base;
          setTheme(finalTheme);
          document.documentElement.classList.toggle('dark', finalTheme === 'dark');
        }
      } catch (e) {
        // fallback using localStorage only
        const stored = localStorage.getItem('theme') || 'dark';
        setTheme(stored);
        document.documentElement.classList.toggle('dark', stored === 'dark');
      } finally {
        setLoaded(true);
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyTheme = useCallback((newTheme) => {
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, allowUserOverride, setTheme: applyTheme, loaded }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
