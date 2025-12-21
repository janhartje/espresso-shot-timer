import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  HAS_SEEN_ONBOARDING: 'hasSeenOnboarding',
  DEBUG_MODE: 'debugMode',
  LAST_SHOT_TIME: 'lastShotTime',
  CALIBRATION_BASELINE: 'calibrationBaseline',
  CALIBRATION_SENSITIVITY: 'calibrationSensitivity',
};

export const storage = {
  // Onboarding
  async getHasSeenOnboarding(): Promise<boolean> {
    const value = await AsyncStorage.getItem(KEYS.HAS_SEEN_ONBOARDING);
    return value === 'true';
  },
  async setHasSeenOnboarding(value: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.HAS_SEEN_ONBOARDING, String(value));
  },
  async resetOnboarding(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.HAS_SEEN_ONBOARDING);
  },

  // Debug Mode
  async getDebugMode(): Promise<boolean> {
    const value = await AsyncStorage.getItem(KEYS.DEBUG_MODE);
    return value ? JSON.parse(value) : false;
  },
  async setDebugMode(value: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.DEBUG_MODE, JSON.stringify(value));
  },

  // Last Shot Time
  async getLastShotTime(): Promise<number | null> {
    const value = await AsyncStorage.getItem(KEYS.LAST_SHOT_TIME);
    return value ? Number(value) : null;
  },
  async setLastShotTime(value: number): Promise<void> {
    await AsyncStorage.setItem(KEYS.LAST_SHOT_TIME, String(value));
  },

  // Calibration
  async getCalibrationBaseline(): Promise<number | null> {
    const value = await AsyncStorage.getItem(KEYS.CALIBRATION_BASELINE);
    return value ? Number(value) : null;
  },
  async setCalibrationBaseline(value: number): Promise<void> {
    await AsyncStorage.setItem(KEYS.CALIBRATION_BASELINE, String(value));
  },

  async getCalibrationSensitivity(): Promise<string | null> {
    return await AsyncStorage.getItem(KEYS.CALIBRATION_SENSITIVITY);
  },
  async setCalibrationSensitivity(value: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.CALIBRATION_SENSITIVITY, value);
  },
};
