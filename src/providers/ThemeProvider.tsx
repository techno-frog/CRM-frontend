import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Theme, ThemeContextType } from '../types/theme.types';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) return savedTheme;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Динамически подгружаем стили темы
    const link = document.getElementById('theme-styles') as HTMLLinkElement;
    if (!link) {
      const newLink = document.createElement('link');
      newLink.id = 'theme-styles';
      newLink.rel = 'stylesheet';
      newLink.href = `/themes/${theme}.css`;
      document.head.appendChild(newLink);
    } else {
      link.href = `/themes/${theme}.css`;
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme хук можно юзать только внутри ThemeProvider, бро');
  }
  return context;
};
