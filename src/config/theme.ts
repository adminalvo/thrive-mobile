export const Colors = {
  // Brand
  primary: '#4CA2B5',       // Thrive Aqua Teal
  primaryDark: '#0D9488',   // Deep Teal
  primaryLight: '#E6FFFA',  // Soft Cyan Tint
  secondary: '#3B82F6',     // Electric Blue
  
  // Backgrounds
  background: '#0A192F',    // Deep Navy
  cardBackground: '#112240',// Slightly lighter navy for cards
  cardElevated: '#1E293B',  // Slate elevated card
  modalBackground: '#0F172A',
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8', // Slate 400
  textMuted: '#64748B',     // Slate 500
  
  // Accents & Statuses
  success: '#10B981',       // Emerald
  successLight: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B',       // Amber
  warningLight: 'rgba(245, 158, 11, 0.15)',
  danger: '#EF4444',        // Rose / Red
  dangerLight: 'rgba(239, 68, 68, 0.15)',
  info: '#06B6D4',          // Cyan
  infoLight: 'rgba(6, 182, 212, 0.15)',
  
  // UI Borders & Dividers
  border: 'rgba(255, 255, 255, 0.08)',
  borderActive: '#4CA2B5',
  glass: 'rgba(255, 255, 255, 0.04)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  titleLarge: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  titleMedium: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  titleSmall: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  bodyLarge: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.textPrimary,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.textMuted,
  },
  caption: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
};
