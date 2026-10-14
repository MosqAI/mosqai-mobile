import { router } from 'expo-router';
import { useNotice } from '@/components/notice';
import { StyleSheet, Text, View } from 'react-native';
import { LanguagePills } from '@/components/language-pills';
import { Card, Header, Row, Screen, text } from '@/components/ui';
import { fmt, useI18n } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { colors, fonts, space } from '@/lib/theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { t } = useI18n();
  const notice = useNotice();

  const confirmSignOut = () =>
    notice.show({
      title: t.profile.logOutTitle,
      message: t.profile.logOutText,
      icon: 'log-out',
      actions: [
        { label: t.common.cancel, variant: 'secondary' },
        { label: t.profile.logOut, variant: 'danger', onPress: () => void signOut() },
      ],
    });

  const initials = (user?.name ?? '')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');

  return (
    <Screen tab header={<Header title={t.profile.title} />}>
      <Card style={styles.user}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={text.h2}>{user?.name}</Text>
          <Text style={text.muted}>{user?.email}</Text>
          {user?.createdAt && <Text style={text.faint}>{fmt(t.profile.memberSince, { year: new Date(user.createdAt).getFullYear() })}</Text>}
        </View>
      </Card>

      <Card style={{ gap: space(3) }}>
        <Text style={text.muted}>{t.common.language}</Text>
        <LanguagePills full />
      </Card>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <Row icon="user" label={t.profile.personal} onPress={() => router.push('/profile/edit')} />
        <Row icon="lock" label={t.profile.changePassword} onPress={() => notice.show({ title: t.profile.changePassword, message: t.profile.changePasswordText, icon: 'tool' })} />
        <Row icon="bell" label={t.profile.notifications} onPress={() => router.push('/settings')} />
        <Row icon="help-circle" label={t.profile.help} onPress={() => router.push('/settings')} />
        <Row icon="log-out" label={t.profile.logOut} danger last onPress={confirmSignOut} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  user: { flexDirection: 'row', alignItems: 'center', gap: space(4) },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.violet,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  avatarText: { color: '#fff', fontSize: 18, fontFamily: fonts.display, fontWeight: '600' },
});
