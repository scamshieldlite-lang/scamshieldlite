export const colors = {
  // Backgrounds
  background:     '#0B1F3A',
  card:           '#112A4A',
  cardElevated:   '#1A3459',

  // Brand
  primary:        '#1E90FF',
  secondary:      '#22C55E',

  // Semantic
  danger:         '#EF4444',
  warning:        '#F59E0B',
  success:        '#22C55E',

  // Text
  textPrimary:    '#FFFFFF',
  textSecondary:  '#A0AEC0',
  textMuted:      '#64748B',

  // Borders
  border:         '#1E3A5F',
  borderSubtle:   '#162F4E',

  // Gradients (used with LinearGradient)
  gradientPrimary:  ['#22C55E', '#1E90FF'] as const,
  gradientAccent:   ['#F59E0B', '#EF4444'] as const,
  gradientCard:     ['#112A4A', '#0B1F3A'] as const,
} as const;

export const spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
} as const;

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  full: 999,
} as const;

export const typography = {
  h1:       { fontSize: 28, fontWeight: '700' as const, color: colors.textPrimary },
  h2:       { fontSize: 22, fontWeight: '700' as const, color: colors.textPrimary },
  h3:       { fontSize: 18, fontWeight: '600' as const, color: colors.textPrimary },
  body:     { fontSize: 15, fontWeight: '400' as const, color: colors.textPrimary },
  bodyMd:   { fontSize: 15, fontWeight: '500' as const, color: colors.textPrimary },
  caption:  { fontSize: 13, fontWeight: '400' as const, color: colors.textSecondary },
  label:    { fontSize: 12, fontWeight: '600' as const, color: colors.textSecondary },
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  subtle: {
    shadowColor: '#1E90FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
} as const;