import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Tokens live in the OS keychain/keystore. The web build (development only)
// falls back to localStorage, which is not secure storage.
const isWeb = Platform.OS === 'web';

export async function getItem(key: string): Promise<string | null> {
  if (isWeb) return globalThis.localStorage?.getItem(key) ?? null;
  return SecureStore.getItemAsync(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) return globalThis.localStorage?.setItem(key, value);
  await SecureStore.setItemAsync(key, value);
}

export async function removeItem(key: string): Promise<void> {
  if (isWeb) return globalThis.localStorage?.removeItem(key);
  await SecureStore.deleteItemAsync(key);
}
