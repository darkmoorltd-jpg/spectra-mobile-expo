import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Badge } from '../../components/ui/Badge';

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { notifications, markAsRead, markAllAsRead, clearAll, unreadCount } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return { name: 'checkmark-circle', color: c.green };
      case 'warning': return { name: 'warning', color: c.orange };
      case 'error': return { name: 'close-circle', color: c.red };
      default: return { name: 'information-circle', color: c.cyan };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      {notifications.length > 0 && (
        <View style={styles.topBar}>
          <Badge text={`${unreadCount} unread`} variant="gold" />
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={{ color: c.cyan, fontSize: 13, fontWeight: '600' }}>Mark all read</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearAll}>
              <Text style={{ color: c.red, fontSize: 13, fontWeight: '600' }}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={64} color={c.textMuted} />
            <Text style={[styles.emptyTitle, { color: c.text }]}>No notifications yet</Text>
            <Text style={[styles.emptyText, { color: c.textDim }]}>
              Scan activities and updates will appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const icon = getIcon(item.type);
          return (
            <TouchableOpacity
              style={[
                styles.item,
                {
                  backgroundColor: item.read ? c.surface : c.elevated,
                  borderColor: item.read ? c.border : c.gold + '40',
                },
              ]}
              onPress={() => markAsRead(item.id)}
            >
              <Ionicons name={icon.name as any} size={28} color={icon.color} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.itemTitle, { color: c.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.itemBody, { color: c.textDim }]} numberOfLines={2}>
                  {item.body}
                </Text>
                <Text style={[styles.itemDate, { color: c.textMuted }]}>
                  {new Date(item.createdAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                  {' · '}
                  {new Date(item.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short' })}
                </Text>
              </View>
              {!item.read && <View style={[styles.dot, { backgroundColor: c.gold }]} />}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2A44',
  },
  empty: { alignItems: 'center', marginTop: 100, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  itemTitle: { fontSize: 15, fontWeight: '700' },
  itemBody: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  itemDate: { fontSize: 11, marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
