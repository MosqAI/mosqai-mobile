import { useId } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors, fonts } from '@/lib/theme';

// MosqAI Shield brand mark, drawn flat after the brand artwork: a mosquito in a
// purple ring (the "O" of MOSQAI) with a crescent sweeping around the right.
// Keep in sync with mosqai-authority-web/src/components/brand/logo.tsx.

const WINGS = 'M18 40 C27 33 40 35 47 40 C40 45 27 46 18 40 Z M82 40 C73 33 60 35 53 40 C60 45 73 46 82 40 Z';
const ANTENNAE = 'M48.6 33 L42 24 M51.4 33 L58 24';
const LEGS = 'M47 44 L37 53 L32 67 M53 44 L63 53 L68 67 M48 48 L42 59 L40 72 M52 48 L58 59 L60 72';

function Mosquito({ body, wing }: { body: string; wing: string }) {
  return (
    <G>
      <Path d={WINGS} fill={wing} />
      <Path d={ANTENNAE} stroke={body} strokeWidth={1.8} strokeLinecap="round" />
      <Path d={LEGS} stroke={body} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Circle cx={50} cy={36.5} r={3.8} fill={body} />
      <Ellipse cx={50} cy={57} rx={3.4} ry={16} fill={body} />
    </G>
  );
}

/** The mosquito ring: the "O" of the wordmark. */
function RingO({ size }: { size: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#8B5CF6" />
          <Stop offset="1" stopColor="#3B1A78" />
        </LinearGradient>
      </Defs>
      <Circle cx={50} cy={50} r={43} fill="none" stroke={`url(#${id}r)`} strokeWidth={9} />
      <Mosquito body={colors.deep} wing={colors.brand} />
    </Svg>
  );
}

/** Square mark (ring, mosquito, crescent). `light` is the white version for purple backgrounds. */
export function Logo({ size = 72, variant = 'dark' }: { size?: number; variant?: 'dark' | 'light' }) {
  const id = useId().replace(/:/g, '');
  const white = variant === 'light';
  const stroke = white ? '#FFFFFF' : `url(#${id}r)`;
  return (
    <Svg width={size * 1.2} height={size} viewBox="0 0 120 100" accessibilityLabel="MosqAI Shield logo">
      <Defs>
        <LinearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#8B5CF6" />
          <Stop offset="1" stopColor="#3B1A78" />
        </LinearGradient>
      </Defs>
      <Path d="M86 6 A46 46 0 0 1 86 94 A38 44 0 0 0 86 6 Z" fill={stroke} />
      <Circle cx={50} cy={50} r={40} fill="none" stroke={stroke} strokeWidth={8} />
      <Mosquito body={white ? '#FFFFFF' : colors.deep} wing={white ? 'rgba(255,255,255,0.8)' : colors.brand} />
    </Svg>
  );
}

/**
 * "MOSQAI Shield" with the mosquito ring as the O. `inline` fits a header;
 * `stacked` puts Shield underneath, with the crescent, for splash and sign-in.
 */
export function Wordmark({ size = 20, layout = 'inline' }: { size?: number; layout?: 'inline' | 'stacked' }) {
  const top = (
    <View style={styles.row}>
      <Text style={[styles.caps, { fontSize: size }]}>M</Text>
      <View style={{ marginHorizontal: size * 0.03 }}>
        <RingO size={size * 0.84} />
      </View>
      <Text style={[styles.caps, { fontSize: size }]}>
        SQ<Text style={{ color: colors.brand }}>AI</Text>
      </Text>
    </View>
  );
  if (layout === 'inline')
    return (
      <View style={styles.row} accessibilityLabel="MosqAI Shield">
        {top}
        <Text style={[styles.shield, { fontSize: size * 0.82, marginLeft: size * 0.3 }]}>Shield</Text>
      </View>
    );
  return (
    <View style={styles.stack} accessibilityLabel="MosqAI Shield">
      <View style={{ paddingRight: size * 0.6 }}>
        {top}
        <Text style={[styles.shield, { fontSize: size * 0.68, textAlign: 'center', marginTop: size * 0.08 }]}>Shield</Text>
        <Svg width={size * 0.5} height={size * 1.95} viewBox="0 0 40 100" style={{ position: 'absolute', right: -size * 0.1, top: -size * 0.2 }}>
          <Defs>
            <LinearGradient id="crescent" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#A47CF3" />
              <Stop offset="1" stopColor="#4C1D95" />
            </LinearGradient>
          </Defs>
          <Path d="M4 2 C30 14 38 34 38 50 C38 70 26 88 4 98 C20 82 26 66 26 50 C26 32 18 16 4 2 Z" fill="url(#crescent)" />
        </Svg>
      </View>
    </View>
  );
}

/** "— BEYOND THE CAPTURE. —" */
export function Tagline() {
  return (
    <View style={styles.row}>
      <View style={styles.rule} />
      <Text style={styles.tagline}>BEYOND THE CAPTURE.</Text>
      <View style={styles.rule} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  stack: { alignItems: 'center' },
  caps: { fontFamily: fonts.displayHeavy, fontWeight: '800', color: colors.deep, letterSpacing: -0.5 },
  shield: { fontFamily: fonts.display, fontWeight: '600', color: colors.deep },
  rule: { width: 24, height: 1, backgroundColor: colors.brand, opacity: 0.6 },
  tagline: { fontFamily: fonts.regular, fontSize: 11, letterSpacing: 3, color: colors.deep, marginHorizontal: 10 },
});
