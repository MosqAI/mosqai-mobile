import { Icon } from '@/components/icon';
import { Tabs } from 'expo-router/js-tabs';
import type { ColorValue } from 'react-native';
import { useI18n } from '@/i18n';
import { colors, fonts } from '@/lib/theme';

import type { IconName } from '@/components/icon';

function TabIcon({ name, color }: { name: IconName; color: ColorValue }) {
  return <Icon name={name} size={20} color={color} />;
}

function icon(name: IconName) {
  return function Icon({ color }: { color: ColorValue }) {
    return <TabIcon name={name} color={color} />;
  };
}

// Floating frosted tab bar: Dashboard, Reports, Devices, Profile.
export default function TabLayout() {
  const { t } = useI18n();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontSize: 11, fontFamily: fonts.semibold, fontWeight: '600' },
        tabBarItemStyle: { paddingTop: 6 },
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          height: 68,
          paddingBottom: 8,
          borderRadius: 28,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          backgroundColor: 'rgba(255,255,255,0.97)',
          shadowColor: '#1E293B',
          shadowOpacity: 0.15,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          elevation: 8,
        },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t.tabs.dashboard, tabBarIcon: icon('home') }} />
      <Tabs.Screen name="reports" options={{ title: t.tabs.reports, tabBarIcon: icon('bar-chart-2') }} />
      <Tabs.Screen name="devices" options={{ title: t.tabs.devices, tabBarIcon: icon('cpu') }} />
      <Tabs.Screen name="profile" options={{ title: t.tabs.profile, tabBarIcon: icon('user') }} />
    </Tabs>
  );
}
