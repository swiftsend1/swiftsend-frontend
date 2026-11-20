import { useContext } from 'react';
import { ThemeContext } from './themeContext';

const defaultValue = { theme: 'light', isDark: false, setTheme: () => {}, toggleTheme: () => {} };

export const useTheme = () => {
  const context = useContext(ThemeContext);
  return context || defaultValue;
};
