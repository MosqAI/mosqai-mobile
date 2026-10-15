import { Icon } from '@/components/icon';
import { useNotice } from '@/components/notice';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field, Header, Screen, text } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useClaimDevice } from '@/lib/queries';
import { colors, fonts, radius, space } from '@/lib/theme';

/**
 * Pairing. "Scan Device" needs a camera QR scanner (expo-camera, development
 * build); until then both paths use the code printed on the device.
 */
export default function AddDeviceScreen() {
  const { t } = useI18n();
  const notice = useNotice();
  const claim = useClaimDevice();
  const [manual, setManual] = useState(false);
  const [form, setForm] = useState({ deviceId: '', pairingCode: '', nickname: '', placement: '' });
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () =>
    claim.mutate(
      {
        deviceId: form.deviceId.trim(),
        pairingCode: form.pairingCode.trim(),
        nickname: form.nickname.trim() || undefined,
        placement: form.placement.trim() || undefined,
      },
      { onSuccess: (device) => router.replace(`/devices/${device.id}`) },
    );

  if (!manual) {
    return (
      <Screen
        header={<Header title={t.add.title} back />}
        footer={
          <>
            <Button title={t.add.enterCode} icon="key" onPress={() => setManual(true)} />
            <Button title={t.add.scan} icon="maximize" variant="secondary" onPress={() => notice.show({ title: t.add.scan, message: t.add.scanText, icon: 'tool' })} />
          </>
        }
      >
        <View style={styles.hero}>
          <View style={styles.halo}>
            <View style={styles.device}>
              <View style={styles.deviceSlot} />
              <Icon name="shield" size={24} color={colors.brand} />
              <View style={styles.led} />
            </View>
          </View>
        </View>
        <Card style={{ gap: space(3) }}>
          <Text style={text.h2}>{t.add.stepsTitle}</Text>
          {[t.add.step1, t.add.step2, t.add.step3].map((step, i) => (
            <View key={step} style={styles.step}>
              <View style={styles.stepNo}>
                <Text style={styles.stepNoText}>{i + 1}</Text>
              </View>
              <Text style={[text.body, { flex: 1 }]}>{step}</Text>
            </View>
          ))}
        </Card>
      </Screen>
    );
  }

  return (
    <Screen
      header={<Header title={t.add.manualTitle} back />}
      footer={<Button title={t.add.title} onPress={submit} loading={claim.isPending} disabled={!form.deviceId || !form.pairingCode} />}
    >
      <Card style={{ gap: space(4) }}>
        <Text style={text.muted}>{t.add.help}</Text>
        <Field icon="hash" placeholder={t.add.deviceId} autoCapitalize="characters" value={form.deviceId} onChangeText={set('deviceId')} accessibilityLabel="Device ID" />
        <Field icon="key" placeholder={t.add.code} autoCapitalize="characters" value={form.pairingCode} onChangeText={set('pairingCode')} error={claim.error?.message} accessibilityLabel="Pairing code" />
        <Field icon="tag" placeholder={t.add.name} autoCapitalize="words" value={form.nickname} onChangeText={set('nickname')} accessibilityLabel="Device name" />
        <Field icon="map-pin" placeholder={t.add.place} autoCapitalize="words" value={form.placement} onChangeText={set('placement')} accessibilityLabel="Placement" />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: space(6) },
  step: { flexDirection: 'row', gap: space(3), alignItems: 'flex-start' },
  stepNo: { width: 24, height: 24, borderRadius: radius.sm, backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center' },
  stepNoText: { fontFamily: fonts.semibold, fontWeight: '600', fontSize: 12, color: colors.brand },
  halo: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  device: {
    width: 108,
    height: 124,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: space(3),
  },
  deviceSlot: { width: 70, height: 6, borderRadius: 3, backgroundColor: 'rgba(148,163,184,0.4)' },
  led: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand },
});
