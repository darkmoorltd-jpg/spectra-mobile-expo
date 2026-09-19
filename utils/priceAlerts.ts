import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PriceAlert {
  id: string;
  mineral: string;
  targetPrice: number;
  currentPrice: number;
  active: boolean;
  createdAt: string;
}

const KEY = 'spectra_price_alerts';

export const getPriceAlerts = async (): Promise<PriceAlert[]> => {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
};

export const savePriceAlert = async (alert: PriceAlert) => {
  const alerts = await getPriceAlerts();
  const existing = alerts.findIndex((a) => a.id === alert.id);
  if (existing >= 0) alerts[existing] = alert;
  else alerts.push(alert);
  await AsyncStorage.setItem(KEY, JSON.stringify(alerts));
};

export const deletePriceAlert = async (id: string) => {
  const alerts = await getPriceAlerts();
  await AsyncStorage.setItem(KEY, JSON.stringify(alerts.filter((a) => a.id !== id)));
};

export const checkPriceAlerts = async (
  currentPrices: Record<string, number>
): Promise<PriceAlert[]> => {
  const alerts = await getPriceAlerts();
  return alerts.filter(
    (a) => a.active && currentPrices[a.mineral] && currentPrices[a.mineral] >= a.targetPrice
  );
};
