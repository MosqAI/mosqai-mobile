import { StyleSheet, View } from 'react-native';
import { colors } from '@/lib/theme';
import { Backdrop } from './backdrop';
import { Tagline, Wordmark } from './logo';

/** Shown while the saved session restores (before translations load, so the copy stays brand-only). */
export function SplashView() {
  return (
    <View style={styles.root} accessibilityLabel="MosqAI Shield">
      <Backdrop />
      <View style={styles.center}>
        <Wordmark size={40} layout="stacked" />
        <View style={{ marginTop: 20 }}>
          <Tagline />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
});
