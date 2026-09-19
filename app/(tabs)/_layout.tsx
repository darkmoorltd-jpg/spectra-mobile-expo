import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';

export default function TabsLayout() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { unreadCount } = useNotifications();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.gold,
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.border,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: c.gold,
        tabBarInactiveTintColor: c.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.scanBtn, { backgroundColor: focused ? c.gold : c.surfaceAlt }]}>
              <Ionicons
                name={focused ? 'camera' : 'camera-outline'}
                size={26}
                color={focused ? '#000' : color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size, focused }) => (
            <View>
              <Ionicons
                name={focused ? 'notifications' : 'notifications-outline'}
                size={size}
                color={color}
              />
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: c.red }]}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'time' : 'time-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scanBtn: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    marginTop: -10,
  },
  badge: {
    position: 'absolute', top: -4, right: -8,
    minWidth: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});
