// MosqAI Shield brand (shared with the authority web): lavender-white page,
// deep purple ink, brand purple accents and flat white cards with a hairline
// border. The `glass*` names are kept so components need no changes.
export const colors = {
  brand: '#7B3FE4',
  brandPressed: '#5B21B6',
  brandSoft: '#F2EBFA',
  deep: '#2E1760',
  violet: '#E26D9F',
  bg: '#FBF9FE',
  glass: '#FFFFFF',
  glassStrong: '#FAF8FF',
  glassBorder: '#E9E5F3',
  card: '#FFFFFF',
  border: '#E9E5F3',
  divider: '#EFECF6',
  ink: '#241544',
  text: '#241544',
  textMuted: '#565170',
  textFaint: '#9894AB',
  success: '#059669',
  successSoft: '#E3F6EE',
  danger: '#E11D48',
  dangerSoft: '#FDE8EC',
  warning: '#B45309',
  warningSoft: '#FEF3DC',
  info: '#6D28D9',
  infoSoft: '#F1EBFF',
  neutralSoft: '#F0EEF6',
} as const;

/** Brand type: Montserrat for headings and numbers, Poppins for everything else. Loaded in app/_layout.tsx. */
export const fonts = {
  display: 'Montserrat_600SemiBold',
  displayBold: 'Montserrat_700Bold',
  displayHeavy: 'Montserrat_800ExtraBold',
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

export const radius = { sm: 6, md: 10, lg: 14, pill: 999 } as const;
export const space = (n: number) => n * 4;

export const shadow = {
  shadowColor: '#1D1638',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 1,
} as const;

/**
 * White switch knob in both states. react-native-web colours the "on" knob
 * with `activeThumbColor` (teal by default), which the native types omit.
 */
export const switchThumb = { thumbColor: '#FFFFFF', activeThumbColor: '#FFFFFF' } as object;
