import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  data?: any;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  pushToken: string | null;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearAll: () => {},
  pushToken: null,
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    initNotifications();
    AsyncStorage.getItem('spectra_notifications').then((saved) => {
      if (saved) setNotifications(JSON.parse(saved));
    });
  }, []);

  const persist = async (list: AppNotification[]) => {
    setNotifications(list);
    await AsyncStorage.setItem('spectra_notifications', JSON.stringify(list));
  };

  const initNotifications = async () => {
    if (!Device.isDevice) return;
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setPushToken(token);
    } catch {}
  };

  const addNotification: NotificationContextValue['addNotification'] = (n) => {
    const newNotif: AppNotification = {
      ...n,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [newNotif, ...notifications];
    persist(updated);
    Notifications.scheduleNotificationAsync({
      content: { title: n.title, body: n.body, data: n.data || {} },
      trigger: null,
    });
  };

  const markAsRead = (id: string) => {
    persist(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    persist(notifications.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => persist([]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        pushToken,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
