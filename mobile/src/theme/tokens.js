/**
 * Edsy Mobile Design Tokens
 * Strictly adheres to design-reference specifications.
 */

export const colors = {
  // Screen and backgrounds
  screen: '#000000',
  bgPrimary: '#000000',
  bgSecondary: '#141414',
  bgCream: '#E5E7DA',
  creamBg: '#E5E7DA',
  creamText: '#111111',

  // Typography
  textPrimary: '#FFFFFF',
  textSecondary: '#757575',
  textMuted: '#8E8E93',
  textDimmed: '#4B4B4B',
  textDark: '#111111',

  // Borders & separators
  borderSubtle: '#333333',
  borderDark: '#262626',
  divider: '#222222',

  // Note Card & Accent palette
  cardBlue: '#6F91B6',
  accentBlue: '#6F91B6',
  cardLight: '#DCE3EB',
  cardYellow: '#CABC3F',
  accentYellow: '#CABC3F',
  cardText: '#111111',

  // Status and tag accents
  tagRed: '#EF4444',
  tagGreen: '#10B981',
  tagBlue: '#3B82F6',
};

export const typography = {
  display: {
    fontSize: 42,
    fontWeight: '300',
    letterSpacing: -1.2,
    lineHeight: 46,
    color: colors.textPrimary,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.8,
    lineHeight: 32,
    color: colors.textPrimary,
  },
  menu: {
    fontSize: 36,
    fontWeight: '300',
    letterSpacing: -1,
    lineHeight: 44,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.textPrimary,
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: colors.textSecondary,
  },
  bodySm: 13,
  bodyMd: 15,
  bodyLg: 17,
};

export const radius = {
  card: 8,
  pill: 9999,
  button: 8,
};
