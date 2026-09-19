import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { getRemainingScans } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Card, StatCard, Avatar, Badge, Button } from '../../components/ui';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const c = theme.colors;

  const [scans, setScans] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await getRemainingScans();
      setScans(data.scans_remaining ?? 0);
    } catch {
      setScans(0);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.gold} />}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: c.textDim }]}>Welcome back 👋</Text>
          <Text style={[styles.email, { color: c.text }]} numberOfLines={1}>
            {user?.email?.split('@')[0] || 'Miner'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/notifications')}
            style={[styles.iconBtn, { backgroundColor: c.surface, borderColor: c.border }]}
          >
            <Ionicons name="notifications-outline" size={22} color={c.text} />
            {unreadCount > 0 && (
              <View style={[styles.notifBadge, { backgroundColor: c.red }]}>
                <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.iconBtn, { backgroundColor: c.surface, borderColor: c.border }]}
          >
            <Ionicons name={theme.mode === 'dark' ? 'sunny' : 'moon'} size={22} color={c.gold} />
          </TouchableOpacity>
          <Avatar name={user?.email} size={44} onPress={() => router.push('/(tabs)/profile')} />
        </View>
      </View>

      {/* HERO SCAN BUTTON */}
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/scan')}
        activeOpacity={0.85}
        style={styles.heroWrapper}
      >
        <LinearGradient
          colors={[c.gold, c.orange]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroIconCircle}>
              <Ionicons name="scan" size={32} color="#000" />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.heroTitle}>SCAN MINERAL</Text>
              <Text style={styles.heroSub}>Point camera → Instant identification</Text>
            </View>
            <Ionicons name="arrow-forward" size={28} color="#000" />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* STATS ROW */}
      <Text style={[styles.sectionTitle, { color: c.text }]}>Your Stats</Text>
      <View style={styles.statsRow}>
        <StatCard icon="🎫" value={scans === null ? '...' : scans} label="Scans Left" accent={c.gold} />
        <StatCard icon="💎" value="7" label="Minerals" accent={c.cyan} />
        <StatCard icon="📊" value="0" label="Total Scans" accent={c.green} />
      </View>

      {/* QUICK ACTIONS */}
      <Text style={[styles.sectionTitle, { color: c.text }]}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <ActionCard
          icon="camera"
          label="Scan"
          color={c.gold}
          onPress={() => router.push('/(tabs)/scan')}
          c={c}
        />
        <ActionCard
          icon="time"
          label="History"
          color={c.cyan}
          onPress={() => router.push('/(tabs)/history')}
          c={c}
        />
        <ActionCard
          icon="card"
          label="Buy Scans"
          color={c.green}
          onPress={() => router.push('/(tabs)/profile')}
          c={c}
        />
        <ActionCard
          icon="map"
          label="Nearby"
          color={c.purple}
          onPress={() => {}}
          c={c}
        />
      </View>

      {/* TIP CARD */}
      <Card style={styles.tipCard}>
        <View style={styles.tipRow}>
          <View style={[styles.tipIconBox, { backgroundColor: c.cyan + '20' }]}>
            <Ionicons name="bulb" size={22} color={c.cyan} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.tipTitle, { color: c.text }]}>Pro Tip</Text>
            <Text style={[styles.tipText, { color: c.textDim }]}>
              Place the mineral on a plain background (paper or cloth) for best AI accuracy.
            </Text>
          </View>
        </View>
      </Card>

      {/* RECENT ACTIVITY */}
      <Text style={[styles.sectionTitle, { color: c.text }]}>Recent</Text>
      <Card style={{ padding: 0 }}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.recentRow,
              { borderBottomColor: c.border, borderBottomWidth: i < 3 ? 1 : 0 },
            ]}
          >
            <View style={[styles.recentIcon, { backgroundColor: c.gold + '20' }]}>
              <Ionicons name="diamond" size={20} color={c.gold} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.recentName, { color: c.text }]}>
                {['Quartz', 'Pyrite', 'Malachite'][i - 1]}
              </Text>
              <Text style={[styles.recentDate, { color: c.textMuted }]}>Recently scanned</Text>
            </View>
            <Badge text={`${[92, 87, 94][i - 1]}%`} variant="success" />
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const ActionCard = ({ icon, label, color, onPress, c }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.actionCard,
      { backgroundColor: c.surface, borderColor: c.border },
    ]}
    activeOpacity={0.7}
  >
    <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={[styles.actionLabel, { color: c.text }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: { fontSize: 13, fontWeight: '500' },
  email: { fontSize: 22, fontWeight: '800', marginTop: 2, textTransform: 'capitalize' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, position: 'relative',
  },
  notifBadge: {
    position: 'absolute', top: -4, right: -4,
    minWidth: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  notifBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  heroWrapper: { marginBottom: 24 },
  hero: { borderRadius: 20, padding: 24 },
  heroContent: { flexDirection: 'row', alignItems: 'center' },
  heroIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { color: '#000', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  heroSub: { color: '#000', fontSize: 12, marginTop: 2, opacity: 0.7 },
  sectionTitle: {
    fontSize: 16, fontWeight: '800', marginBottom: 12, marginTop: 8,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, marginBottom: 20,
  },
  actionCard: {
    width: (width - 50) / 2,
    borderRadius: 16, borderWidth: 1,
    padding: 20, alignItems: 'center',
  },
  actionIcon: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  actionLabel: { fontSize: 14, fontWeight: '700' },
  tipCard: { marginBottom: 20 },
  tipRow: { flexDirection: 'row', alignItems: 'center' },
  tipIconBox: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  tipTitle: { fontSize: 14, fontWeight: '700' },
  tipText: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  recentRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  recentIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  recentName: { fontSize: 14, fontWeight: '700' },
  recentDate: { fontSize: 11, marginTop: 2 },
});
