import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, type IconName } from '@/components/icon';
import { Button, text } from '@/components/ui';
import { useI18n } from '@/i18n';
import { colors, radius, space } from '@/lib/theme';

type Action = { label: string; onPress?: () => void; variant?: 'primary' | 'secondary' | 'danger' };
type Notice = { title: string; message: string; icon?: IconName; actions?: Action[] };

const NoticeContext = createContext<{ show: (n: Notice) => void; underDevelopment: () => void } | null>(null);

/**
 * In-app popup that works on phones and on the web build (React Native's Alert
 * does nothing in a browser). Use `underDevelopment()` for features whose
 * hardware or backend support isn't ready yet.
 */
export function NoticeProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [notice, setNotice] = useState<Notice | null>(null);
  const close = useCallback(() => setNotice(null), []);

  const value = useMemo(
    () => ({
      show: setNotice,
      underDevelopment: () =>
        setNotice({ title: t.common.underDevTitle, message: t.common.underDevText, icon: 'tool' }),
    }),
    [t],
  );

  const actions = notice?.actions ?? [{ label: t.common.ok }];

  return (
    <NoticeContext.Provider value={value}>
      {children}
      <Modal visible={notice !== null} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.scrim} onPress={close} accessibilityLabel={t.common.cancel}>
          {/* Inner Pressable swallows taps so only the scrim closes the popup */}
          <Pressable style={styles.sheet} onPress={() => {}} accessibilityRole="alert">
            {notice?.icon && (
              <View style={styles.badge}>
                <Icon name={notice.icon} size={22} color={colors.warning} />
              </View>
            )}
            <Text style={[text.h1, styles.center]}>{notice?.title}</Text>
            <Text style={[text.muted, styles.center]}>{notice?.message}</Text>
            <View style={styles.actions}>
              {actions.map((a, i) => (
                <Button
                  key={a.label}
                  title={a.label}
                  variant={a.variant ?? (i === actions.length - 1 ? 'primary' : 'secondary')}
                  onPress={() => {
                    close();
                    a.onPress?.();
                  }}
                />
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </NoticeContext.Provider>
  );
}

export function useNotice() {
  const ctx = useContext(NoticeContext);
  if (!ctx) throw new Error('useNotice must be used inside NoticeProvider');
  return ctx;
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(36, 21, 68, 0.45)', alignItems: 'center', justifyContent: 'center', padding: space(6) },
  sheet: { width: '100%', maxWidth: 380, backgroundColor: colors.card, borderRadius: radius.lg, padding: space(6), gap: space(3) },
  badge: { alignSelf: 'center', width: 48, height: 48, borderRadius: radius.lg, backgroundColor: colors.warningSoft, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
  actions: { gap: space(2), marginTop: space(2) },
});
