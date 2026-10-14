import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, Header, Pills, Screen } from '@/components/ui';
import { dictionaries, LANGUAGES, useI18n, type Language } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { useUpdateProfile } from '@/lib/queries';
import { colors, fonts, radius, space } from '@/lib/theme';

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space(2) }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export default function EditProfileScreen() {
  const { user, setUser } = useAuth();
  const { t, lang } = useI18n();
  const update = useUpdateProfile();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [language, setLanguage] = useState<Language>(lang);

  const save = () =>
    update.mutate(
      { name: name.trim(), phone: phone.trim() || null, language },
      {
        onSuccess: (updated) => {
          setUser(updated);
          router.back();
        },
      },
    );

  return (
    <Screen
      header={<Header title={t.profile.edit} back />}
      footer={<Button title={t.common.save} onPress={save} loading={update.isPending} disabled={name.trim().length < 2} />}
    >
      <Card style={{ gap: space(4) }}>
        <Labeled label={t.profile.fullName}>
          <TextInput style={styles.input} value={name} onChangeText={setName} autoCapitalize="words" accessibilityLabel="Full name" />
        </Labeled>
        <Labeled label={t.profile.email}>
          {/* Email is the login identity; changing it needs verification, which isn't built yet. */}
          <TextInput style={[styles.input, styles.readonly]} value={user?.email} editable={false} accessibilityLabel="Email" />
        </Labeled>
        <Labeled label={t.profile.phone}>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+250 7XX XXX XXX"
            placeholderTextColor={colors.textFaint}
            keyboardType="phone-pad"
            accessibilityLabel="Phone number"
          />
        </Labeled>
        <Labeled label={t.common.language}>
          <Pills options={LANGUAGES.map((l) => ({ value: l, label: dictionaries[l].meta.languageName }))} value={language} onChange={setLanguage} />
        </Labeled>
      </Card>
      {update.error && <Text style={{ color: colors.danger }}>{update.error.message}</Text>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontFamily: fonts.semibold, fontWeight: '600', color: colors.textMuted },
  input: {
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    paddingHorizontal: space(4),
    minHeight: 52,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.glassStrong,
  },
  readonly: { color: colors.textMuted, backgroundColor: 'rgba(255,255,255,0.4)' },
});
