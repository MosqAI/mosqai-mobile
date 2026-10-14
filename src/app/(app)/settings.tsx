import Constants from 'expo-constants';
import { useNotice } from '@/components/notice';
import { Linking, Text } from 'react-native';
import { LanguagePills } from '@/components/language-pills';
import { Card, Header, Row, Screen, text } from '@/components/ui';
import { fmt, useI18n } from '@/i18n';
import { space } from '@/lib/theme';

export default function SettingsScreen() {
  const { t } = useI18n();
  const notice = useNotice();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <Screen header={<Header title={t.settings.title} back />}>
      <Card style={{ gap: space(3) }}>
        <Text style={text.muted}>{t.settings.appLanguage}</Text>
        <LanguagePills full />
      </Card>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <Row icon="bell" label={t.settings.notifications} onPress={() => notice.show({ title: t.settings.notifications, message: t.settings.notificationsText, icon: 'tool' })} />
        <Row icon="lock" label={t.settings.privacy} onPress={() => notice.show({ title: t.settings.privacy, message: t.settings.privacyText, icon: 'lock' })} />
        <Row icon="info" label={t.settings.about} value={`v${version}`} onPress={() => notice.show({ title: 'MosqAI Shield', message: fmt(t.settings.version, { version }), icon: 'info' })} />
        <Row icon="help-circle" label={t.settings.help} last onPress={() => void Linking.openURL('mailto:support@mosqai.rw')} />
      </Card>
      <Text style={[text.faint, { textAlign: 'center' }]}>{t.auth.tagline}</Text>
    </Screen>
  );
}
