import { Icon } from '@/components/icon';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useNotice } from '@/components/notice';
import { useI18n } from '@/i18n';
import { HARDWARE_CONTROL } from '@/lib/features';
import { useScheduleMutations, useSchedules } from '@/lib/queries';
import { colors, fonts, radius, space, switchThumb } from '@/lib/theme';
import type { Command, ScheduleRule } from '@/lib/types';
import { Badge, Button, Card, Pills, text } from './ui';

/**
 * Big power button. Shows only the power state the device confirmed; while a
 * SET_POWER command is in flight it shows a spinner instead of guessing.
 */
export function PowerCard({
  power,
  pending,
  disabled,
  onToggle,
}: {
  power: boolean | null;
  pending: boolean;
  disabled: boolean;
  onToggle: (on: boolean) => void;
}) {
  const { t } = useI18n();
  const on = power === true;
  return (
    <Card style={styles.power}>
      <Pressable
        onPress={() => onToggle(!on)}
        disabled={disabled || pending || (HARDWARE_CONTROL && power === null)}
        accessibilityRole="switch"
        accessibilityState={{ checked: on, disabled: disabled || pending, busy: pending }}
        accessibilityLabel={t.controls.power}
        style={({ pressed }) => [styles.powerButton, on ? styles.powerOn : styles.powerOff, pressed && { transform: [{ scale: 0.96 }] }, disabled && { opacity: 0.5 }]}
      >
        {pending ? <ActivityIndicator color={colors.brand} /> : <Icon name="power" size={24} color={on ? colors.brand : colors.textMuted} />}
      </Pressable>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={text.h2}>{t.controls.power}</Text>
        <Text style={[text.body, { fontFamily: fonts.semibold, fontWeight: '600', color: on ? colors.success : colors.textMuted }]}>
          {power === null ? t.controls.stateUnknown : on ? t.controls.powerOnState : t.controls.powerOffState}
        </Text>
        <Text style={text.faint}>{t.controls.powerHint}</Text>
      </View>
    </Card>
  );
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first

function daysLabel(days: number[], names: string[], everyDay: string) {
  return days.length === 0 || days.length === 7 ? everyDay : DAY_ORDER.filter((d) => days.includes(d)).map((d) => names[d]).join(', ');
}

/** Rule list + add form. Changes sync to the device; the latest sync status is shown. */
export function ScheduleCard({ deviceId, automatic, lastSync }: { deviceId: string; automatic: boolean; lastSync?: Command }) {
  const { t } = useI18n();
  const c = t.controls;
  const schedules = useSchedules(deviceId);
  const m = useScheduleMutations(deviceId);
  const { underDevelopment } = useNotice();
  // Schedules only matter once the trap can be switched remotely
  const guard = <A extends unknown[]>(fn: (...args: A) => void) => (HARDWARE_CONTROL ? fn : () => underDevelopment());
  const [adding, setAdding] = useState(false);
  const [action, setAction] = useState<'ON' | 'OFF'>('ON');
  const [time, setTime] = useState('18:00');
  const [days, setDays] = useState<number[]>([]);
  const busy = m.create.isPending || m.update.isPending || m.remove.isPending;
  const validTime = TIME.test(time);

  const save = () =>
    m.create.mutate(
      { action, time, days, enabled: true },
      {
        onSuccess: () => {
          setAdding(false);
          setDays([]);
        },
      },
    );

  const nightPreset = async () => {
    await m.create.mutateAsync({ action: 'ON', time: '18:00', days: [], enabled: true });
    await m.create.mutateAsync({ action: 'OFF', time: '06:00', days: [], enabled: true });
  };

  const syncState =
    !lastSync || lastSync.status === 'CONFIRMED'
      ? lastSync && { label: c.synced, tone: 'success' as const }
      : lastSync.status === 'PENDING' || lastSync.status === 'SENT'
        ? { label: c.syncing, tone: 'info' as const }
        : { label: c.syncFailed, tone: 'warning' as const };

  const rules = schedules.data ?? [];

  return (
    <Card style={{ gap: space(3) }}>
      <View style={styles.head}>
        <Icon name="clock" size={18} color={colors.brand} />
        <Text style={[text.h2, { flex: 1 }]}>{c.schedule}</Text>
        {syncState && <Badge label={syncState.label} tone={syncState.tone} />}
      </View>
      <Text style={text.faint}>{c.scheduleHint}</Text>
      {!automatic && rules.length > 0 && (
        <View style={styles.notice}>
          <Icon name="info" size={14} color={colors.warning} />
          <Text style={[text.faint, { flex: 1, color: colors.warning }]}>{c.autoOnly}</Text>
        </View>
      )}

      {schedules.isLoading ? (
        <ActivityIndicator color={colors.brand} />
      ) : rules.length === 0 && !adding ? (
        <Text style={text.muted}>{c.noRules}</Text>
      ) : (
        rules.map((r: ScheduleRule) => (
          <View key={r.id} style={[styles.rule, !r.enabled && { opacity: 0.55 }]}>
            <View style={styles.ruleIcon}>
              <Icon name={r.action === 'ON' ? 'sun' : 'moon'} size={16} color={r.action === 'ON' ? colors.brand : colors.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ruleTime}>
                {r.time} <Text style={styles.ruleAction}>{r.action === 'ON' ? c.ruleOn : c.ruleOff}</Text>
              </Text>
              <Text style={text.faint}>{daysLabel(r.days, c.weekdays, c.everyDay)}</Text>
            </View>
            <Switch
              value={r.enabled}
              disabled={busy}
              onValueChange={guard((enabled: boolean) => m.update.mutate({ id: r.id, enabled }))}
              trackColor={{ true: colors.brand, false: colors.border }}
              {...switchThumb}
              accessibilityLabel={`${r.time} ${r.action === 'ON' ? c.ruleOn : c.ruleOff}`}
            />
            <Pressable onPress={guard(() => m.remove.mutate(r.id))} disabled={busy} hitSlop={8} accessibilityRole="button" accessibilityLabel={c.remove}>
              <Icon name="trash-2" size={18} color={colors.textFaint} />
            </Pressable>
          </View>
        ))
      )}

      {adding ? (
        <View style={styles.form}>
          <Text style={text.muted}>{c.newRule}</Text>
          <Pills
            options={[
              { value: 'ON' as const, label: c.ruleOn },
              { value: 'OFF' as const, label: c.ruleOff },
            ]}
            value={action}
            onChange={setAction}
          />
          <View style={{ gap: space(1) }}>
            <Text style={text.faint}>{c.time}</Text>
            <TextInput
              value={time}
              onChangeText={setTime}
              placeholder="18:30"
              placeholderTextColor={colors.textFaint}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              style={[styles.timeInput, !validTime && { borderColor: colors.danger }]}
              accessibilityLabel={c.time}
            />
            {!validTime && <Text style={{ color: colors.danger, fontSize: 12 }}>{c.invalidTime}</Text>}
          </View>
          <View style={{ gap: space(1.5) }}>
            <Text style={text.faint}>
              {c.days} · {daysLabel(days, c.weekdays, c.everyDay)}
            </Text>
            <View style={styles.days}>
              {DAY_ORDER.map((d) => {
                const active = days.includes(d);
                return (
                  <Pressable
                    key={d}
                    onPress={() => setDays((cur) => (active ? cur.filter((x) => x !== d) : [...cur, d]))}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: active }}
                    style={[styles.day, active && styles.dayActive]}
                  >
                    <Text style={[styles.dayText, active && { color: '#fff' }]}>{c.weekdays[d]}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={styles.formActions}>
            <View style={{ flex: 1 }}>
              <Button title={c.cancel} variant="secondary" onPress={() => setAdding(false)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title={c.save} onPress={save} loading={m.create.isPending} disabled={!validTime} />
            </View>
          </View>
        </View>
      ) : (
        <View style={{ gap: space(2) }}>
          <Button title={c.addRule} icon="plus" variant="secondary" onPress={guard(() => setAdding(true))} disabled={busy} />
          {rules.length === 0 && <Button title={c.nightPreset} icon="moon" variant="secondary" onPress={guard(() => void nightPreset())} disabled={busy} />}
        </View>
      )}
      {(m.create.error || m.update.error || m.remove.error) && (
        <Text style={{ color: colors.danger }}>{(m.create.error ?? m.update.error ?? m.remove.error)?.message}</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  power: { flexDirection: 'row', alignItems: 'center', gap: space(4) },
  powerButton: { width: 60, height: 60, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  powerOn: { backgroundColor: colors.brandSoft, borderColor: colors.brand },
  powerOff: { backgroundColor: colors.card, borderColor: colors.border },
  head: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  notice: { flexDirection: 'row', alignItems: 'center', gap: space(2), backgroundColor: colors.warningSoft, padding: space(2.5), borderRadius: radius.md },
  rule: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingVertical: space(2), borderBottomWidth: 1, borderBottomColor: colors.divider },
  ruleIcon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  ruleTime: { fontSize: 16, fontFamily: fonts.display, fontWeight: '600', color: colors.text },
  ruleAction: { fontSize: 13, fontFamily: fonts.semibold, fontWeight: '600', color: colors.textMuted },
  form: { gap: space(3), padding: space(3), borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.55)' },
  timeInput: {
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glassStrong,
    borderRadius: radius.md,
    paddingHorizontal: space(4),
    minHeight: 50,
    fontSize: 17,
    fontFamily: fonts.semibold, fontWeight: '600',
    color: colors.text,
    width: 110,
  },
  days: { flexDirection: 'row', flexWrap: 'wrap', gap: space(1.5) },
  day: { minWidth: 40, paddingHorizontal: space(2), paddingVertical: space(1.5), borderRadius: radius.md, alignItems: 'center', backgroundColor: colors.glassStrong, borderWidth: 1, borderColor: colors.glassBorder },
  dayActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  dayText: { fontSize: 12, fontFamily: fonts.semibold, fontWeight: '600', color: colors.textMuted },
  formActions: { flexDirection: 'row', gap: space(2) },
});
