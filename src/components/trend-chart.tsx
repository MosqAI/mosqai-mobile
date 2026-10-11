import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { useI18n } from '@/i18n';
import { colors } from '@/lib/theme';

const H = 150;
const PAD = { top: 10, right: 8, bottom: 22, left: 28 };

/**
 * Daily captures as an area line. Days with no reporting device (null) break the
 * line and are marked below the axis, so "unknown" never reads as zero.
 */
export function TrendChart({ data }: { data: { date: string; captures: number | null }[] }) {
  const { t, f } = useI18n();
  const [width, setWidth] = useState(0);
  const known = data.filter((d) => d.captures !== null).map((d) => d.captures!);
  const max = Math.max(10, ...known);
  const niceMax = Math.ceil(max / 20) * 20;
  const w = width - PAD.left - PAD.right;
  const h = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (data.length > 1 ? (i / (data.length - 1)) * w : w / 2);
  const y = (v: number) => PAD.top + h - (v / niceMax) * h;

  // Split into runs of known values.
  const runs: { i: number; v: number }[][] = [];
  data.forEach((d, i) => {
    if (d.captures === null) runs.push([]);
    else (runs.at(-1) ?? runs[runs.push([]) - 1]).push({ i, v: d.captures });
  });
  const segments = runs.filter((r) => r.length > 0);
  const linePath = (r: { i: number; v: number }[]) => r.map((p, k) => `${k ? 'L' : 'M'}${x(p.i)},${y(p.v)}`).join(' ');
  const areaPath = (r: { i: number; v: number }[]) =>
    `${linePath(r)} L${x(r.at(-1)!.i)},${PAD.top + h} L${x(r[0].i)},${PAD.top + h} Z`;
  const labelEvery = Math.ceil(data.length / 7);

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} accessibilityLabel="Daily capture trend chart">
      {width > 0 && (
        <Svg width={width} height={H}>
          <Defs>
            <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.brand} stopOpacity={0.18} />
              <Stop offset="1" stopColor={colors.brand} stopOpacity={0.02} />
            </LinearGradient>
          </Defs>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <Line key={t} x1={PAD.left} x2={width - PAD.right} y1={PAD.top + h * t} y2={PAD.top + h * t} stroke="rgba(148,163,184,0.25)" />
          ))}
          {[0, 0.5, 1].map((t) => (
            <SvgText key={t} x={PAD.left - 6} y={PAD.top + h * (1 - t) + 4} fontSize={10} fill={colors.textFaint} textAnchor="end">
              {Math.round(niceMax * t)}
            </SvgText>
          ))}
          {segments.map((r) => (
            <Path key={`a${r[0].i}`} d={areaPath(r)} fill="url(#fill)" />
          ))}
          {segments.map((r) => (
            <Path key={`l${r[0].i}`} d={linePath(r)} stroke={colors.brand} strokeWidth={1.75} fill="none" strokeLinejoin="round" />
          ))}
          {data.map((d, i) =>
            d.captures === null ? (
              <Circle key={d.date} cx={x(i)} cy={PAD.top + h} r={2.5} fill={colors.card} stroke={colors.textFaint} strokeWidth={1} />
            ) : (
              <Circle key={d.date} cx={x(i)} cy={y(d.captures)} r={2.5} fill={colors.brand} />
            ),
          )}
          {data.map((d, i) =>
            i % labelEvery === 0 || i === data.length - 1 ? (
              <SvgText key={`t${d.date}`} x={x(i)} y={H - 4} fontSize={10} fill={colors.textFaint} textAnchor="middle">
                {f.shortDate(`${d.date}T12:00:00Z`)}
              </SvgText>
            ) : null,
          )}
        </Svg>
      )}
      {data.some((d) => d.captures === null) && (
        <Text style={styles.note}>{t.common.unknownDay}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  note: { fontSize: 11, color: colors.textFaint, marginTop: 4 },
});
