export const colors = {
  background: '#0B0D10',
  surface: '#151821',
  card: '#F7F8FA',
  cardMuted: '#EEF1F6',
  textPrimary: '#F5F7FA',
  textSecondary: '#CDD3DB',
  textMuted: '#9AA3AE',
  textOnCard: '#1C2128',
  border: '#E3E6EB',
  borderDark: 'rgba(255,255,255,0.08)',
  accent: '#2E6FF2',
  accentMuted: 'rgba(46,111,242,0.15)',
  danger: '#E05252',
  dangerMuted: 'rgba(224,82,82,0.12)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
};

export const typography = {
  title: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  section: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
  },
  meta: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
};

export const shadow = {
  card: {
    shadowColor: '#0B0D10',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
};

export const theme = { colors, spacing, radius, typography, shadow };
