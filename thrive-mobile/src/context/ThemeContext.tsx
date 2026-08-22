import React, { createContext, useContext } from 'react';
import { Colors, Spacing, Radius, Typography } from '../config/theme';

interface ThemeContextType {
  colors: typeof Colors;
  spacing: typeof Spacing;
  radius: typeof Radius;
  typography: typeof Typography;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: Colors,
  spacing: Spacing,
  radius: Radius,
  typography: Typography,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ colors: Colors, spacing: Spacing, radius: Radius, typography: Typography }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
