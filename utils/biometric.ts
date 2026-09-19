import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const isBiometricAvailable = async (): Promise<boolean> => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
};

export const authenticateWithBiometric = async (): Promise<boolean> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to continue',
      fallbackLabel: 'Use password',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch {
    return false;
  }
};

export const isBiometricEnabled = async (): Promise<boolean> => {
  return (await AsyncStorage.getItem('spectra_biometric_enabled')) === 'true';
};

export const setBiometricEnabled = async (enabled: boolean) => {
  await AsyncStorage.setItem('spectra_biometric_enabled', enabled ? 'true' : 'false');
};
