import { useState, useEffect, useCallback } from 'react';
import { Theme, AccentColor, UserPreferences } from '../types';

const STORAGE_KEY = 'openclaw-webchat:preferences';

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  accentColor: 'cyan',
  sidebarWidth: 280,
  fontSize: 14,
  lineHeight: 1.6,
};

export function useTheme() {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultPreferences;
  });

  // 应用主题到 CSS 变量
  useEffect(() => {
    applyTheme(preferences.theme, preferences.accentColor);
  }, [preferences.theme, preferences.accentColor]);

  // 保存偏好设置
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const setTheme = useCallback((theme: Theme) => {
    setPreferences((prev) => ({ ...prev, theme }));
  }, []);

  const setAccentColor = useCallback((accentColor: AccentColor) => {
    setPreferences((prev) => ({ ...prev, accentColor }));
  }, []);

  const setSidebarWidth = useCallback((sidebarWidth: number) => {
    setPreferences((prev) => ({ ...prev, sidebarWidth }));
  }, []);

  return {
    preferences,
    theme: preferences.theme,
    accentColor: preferences.accentColor,
    setTheme,
    setAccentColor,
    setSidebarWidth,
  };
}

// 应用主题到 CSS 变量
function applyTheme(theme: Theme, accent: AccentColor) {
  const root = document.documentElement;
  
  const themes = {
    dark: {
      '--bg-primary': '#18181b',
      '--bg-secondary': '#27272a',
      '--bg-tertiary': '#3f3f46',
      '--bg-message-user': '#3f3f46',
      '--bg-message-assistant': 'transparent',
      '--text-primary': '#fafafa',
      '--text-secondary': '#a1a1aa',
      '--text-muted': '#71717a',
      '--border-color': '#3f3f46',
      '--hover-bg': '#27272a',
    },
    light: {
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f4f4f5',
      '--bg-tertiary': '#e4e4e7',
      '--bg-message-user': '#e4e4e7',
      '--bg-message-assistant': 'transparent',
      '--text-primary': '#18181b',
      '--text-secondary': '#52525b',
      '--text-muted': '#71717a',
      '--border-color': '#e4e4e7',
      '--hover-bg': '#f4f4f5',
    },
    oled: {
      '--bg-primary': '#000000',
      '--bg-secondary': '#0a0a0a',
      '--bg-tertiary': '#1a1a1a',
      '--bg-message-user': '#1a1a1a',
      '--bg-message-assistant': 'transparent',
      '--text-primary': '#ffffff',
      '--text-secondary': '#a1a1aa',
      '--text-muted': '#71717a',
      '--border-color': '#1a1a1a',
      '--hover-bg': '#0a0a0a',
    },
  };

  const accents = {
    cyan: {
      '--accent-primary': '#06b6d4',
      '--accent-hover': '#0891b2',
      '--accent-light': 'rgba(6, 182, 212, 0.1)',
    },
    violet: {
      '--accent-primary': '#8b5cf6',
      '--accent-hover': '#7c3aed',
      '--accent-light': 'rgba(139, 92, 246, 0.1)',
    },
    emerald: {
      '--accent-primary': '#10b981',
      '--accent-hover': '#059669',
      '--accent-light': 'rgba(16, 185, 129, 0.1)',
    },
    amber: {
      '--accent-primary': '#f59e0b',
      '--accent-hover': '#d97706',
      '--accent-light': 'rgba(245, 158, 11, 0.1)',
    },
    rose: {
      '--accent-primary': '#f43f5e',
      '--accent-hover': '#e11d48',
      '--accent-light': 'rgba(244, 63, 94, 0.1)',
    },
    blue: {
      '--accent-primary': '#3b82f6',
      '--accent-hover': '#2563eb',
      '--accent-light': 'rgba(59, 130, 246, 0.1)',
    },
  };

  const themeVars = themes[theme];
  const accentVars = accents[accent];

  Object.entries(themeVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  Object.entries(accentVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
