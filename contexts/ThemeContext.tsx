import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light';

export interface Theme {
  mode: ThemeMode;
  colors: {
    // Backgrounds
    bg: string;
    bgAlt: string;
    surface: string;
    surfaceAlt: string;
    elevated: string;
    // Borders
    border: string;
    borderLight: string;
    // Accents
    gold: string;
    cyan: string;
    green: string;
    red: string;
    orange: string;
    purple: string;
    // Text
    text: string;
    textDim: string;
    textMuted: string;
    // Status
    success: string;
    warning: string;
    error: string;
    info: string;
    // Overlay
    overlay: string;
    shadow: string;
  };
}

const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    bg: '#0A0E17',
    bgAlt: '#0D1B2A',
    surface: '#111827',
    surfaceAlt: '#1A2332',
    elevated: '#1F2A44',
    border: '#1F2A44',
    borderLight: '#2A3654',
    gold: '#FFD700',
    cyan: '#00E5FF',
    green: '#00C853',
    red: '#FF1744',
    orange: '#FF9800',
    purple: '#7C4DFF',
    text: '#E8E8E8',
    textDim: '#8892B0',
    textMuted: '#5A6580',
    success: '#00C853',
    warning: '#FF9800',
    error: '#FF1744',
    info: '#00E5FF',
    overlay: 'rgba(0,0,0,0.6)',
    shadow: '#000000',
  },
};

const lightTheme: Theme = {
  mode: 'light',
  colors: {
    bg: '#F5F7FA',
    bgAlt: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#F0F3F8',
    elevated: '#FFFFFF',
    border: '#E0E5EC',
    borderLight: '#EFF2F6',
    gold: '#D4A800',
    cyan: '#0099CC',
    green: '#00A844',
    red: '#D50000',
    orange: '#E67C00',
    purple: '#6200EA',
    text: '#1A1D24',
    textDim: '#5A6580',
    textMuted: '#8892B0',
    success: '#00A844',
    warning: '#E67C00',
    error: '#D50000',
    info: '#0099CC',
    overlay: 'rgba(0,0,0,0.4)',
    shadow: '#000000',
  },
};

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: darkTheme,
  toggleTheme: () => {},
  setMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem('spectra_theme').then((saved) => {
      if (saved === 'dark' || saved === 'light') setModeState(saved);
    });
  }, []);

  const setMode = async (m: ThemeMode) => {
    setModeState(m);
    await AsyncStorage.setItem('spectra_theme', m);
  };

  const toggleTheme = () => setMode(mode === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme: mode === 'dark' ? darkTheme : lightTheme, toggleTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
