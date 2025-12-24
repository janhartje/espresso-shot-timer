import Purchases, { PurchasesPackage, PurchasesOffering } from 'react-native-purchases';
import { Platform } from 'react-native';

interface Logger {
    log: (message: string, ...args: any[]) => void;
}

let logger: Logger | null = null;

export const setRevenueCatLogger = (l: Logger) => {
    logger = l;
};

const log = (message: string, ...args: any[]) => {
    if (logger) {
        logger.log(`[RevenueCat] ${message}`, ...args);
    } else {
        // Fallback or silence? Keeping silence or conditional log might be safer to respect DebugMode.
        // Assuming if no logger is set, we might be in early init or debug mode is off.
        // However, for critical setup errors, maybe we still want console?
        // Let's stick to only using the logger if provided, to respect the "checking" requirement.
    }
};

// API Keys from environment variables (set in .env or EAS Secrets)
const API_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '',
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '',
};

let isConfigured = false;

export const initRevenueCat = async () => {
  if (!API_KEYS.ios && !API_KEYS.android) {
    log('No API keys configured. Set EXPO_PUBLIC_REVENUECAT_IOS_KEY and/or EXPO_PUBLIC_REVENUECAT_ANDROID_KEY.');
    return;
  }

  try {
    if (Platform.OS === 'ios') {
        await Purchases.configure({ apiKey: API_KEYS.ios });
    } else if (Platform.OS === 'android') {
        await Purchases.configure({ apiKey: API_KEYS.android });
    }
    isConfigured = true;
  } catch (e) {
      log('Failed to configure', e);
  }
};

export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  if (!isConfigured) return null;
  
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current !== null) {
      return offerings.current;
    }
  } catch (e: any) {
    if (!e.message.includes('There is no singleton instance')) {
        log('Error fetching offerings:', e);
    }
  }
  return null;
};

export const purchasePackage = async (pack: PurchasesPackage) => {
  if (!isConfigured) return;

  try {
    const { customerInfo } = await Purchases.purchasePackage(pack);
    return customerInfo;
  } catch (e: any) {
    if (!e.userCancelled) {
      log('Error purchasing package:', e);
      throw e;
    }
  }
};

export const restorePurchases = async () => {
    if (!isConfigured) {
        log('Not configured, cannot restore purchases.');
        return null;
    }

    try {
        const customerInfo = await Purchases.restorePurchases();
        return customerInfo;
    } catch (e) {
        log('Error restoring purchases:', e);
        throw e;
    }
}

export const isRevenueCatConfigured = () => isConfigured;
