import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

// Sound assets (we'll use simple URLs for now — you can replace with local files)
const SOUNDS = {
  tap: null,        // silent + haptic only
  success: null,    // haptic success
  error: null,      // haptic error
  scan: null,
};

let soundEnabled = true;

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
};

export const tapFeedback = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export const mediumFeedback = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

export const successFeedback = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

export const errorFeedback = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

export const warningFeedback = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

export const selectionFeedback = () => {
  Haptics.selectionAsync();
};

export const playSuccess = async () => {
  successFeedback();
  if (!soundEnabled) return;
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/success.mp3')
    );
    await sound.playAsync();
  } catch {}
};

export const playError = async () => {
  errorFeedback();
  if (!soundEnabled) return;
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/error.mp3')
    );
    await sound.playAsync();
  } catch {}
};

export const playScan = async () => {
  mediumFeedback();
  if (!soundEnabled) return;
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/scan.mp3')
    );
    await sound.playAsync();
  } catch {}
};
