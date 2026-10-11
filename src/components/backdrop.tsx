import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

/** Quiet page background: a soft violet wash at the top fading to off-white. */
export function Backdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMin slice">
        <Defs>
          <LinearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F3EEFF" />
            <Stop offset="0.45" stopColor="#FBFAFF" />
            <Stop offset="1" stopColor="#FBFAFF" />
          </LinearGradient>
          <RadialGradient id="pink" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor="#E26D9F" stopOpacity={0.12} />
            <Stop offset="1" stopColor="#E26D9F" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="390" height="844" fill="url(#wash)" />
        <Ellipse cx="360" cy="40" rx="220" ry="150" fill="url(#pink)" />
      </Svg>
    </View>
  );
}
