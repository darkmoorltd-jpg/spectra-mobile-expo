import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { getRemainingScans } from '../../services/api';
import { colors } from '../../constants/theme';

export default function HomeScreen() {
  const { user } = useAuth();
  const [scans, setScans] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await getRemainingScans();
      setScans(data.scans_remaining ?? 0);
    } catch (_) {
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
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
    >
      <Text style={styles.welcome}>Welcome back,</Text>
      <Text style={styles.email}>{user?.email || 'Miner'}</Text>

      <View style={styles.statsRow}>
        <StatCard label="Scans Left" value={scans === null ? '...' : String(scans)} icon="🎫" />
        <StatCard label="Minerals" value="7" icon="💎" />
      </View>

      <TouchableOpacity style={styles.bigButton} onPress={() => router.push('/(tabs)/scan')}>
        <Text style={styles.bigButtonIcon}>📸</Text>
        <Text style={styles.bigButtonText}>SCAN MINERAL</Text>
        <Text style={styles.bigButtonSub}>Take a photo to identify</Text>
      </TouchableOpacity>

      <View style={styles.quickRow}>
        <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/(tabs)/history')}>
          <Text style={styles.quickIcon}>📊</Text>
          <Text style={styles.quickText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/(tabs)/profile')}>
          <Text style={styles.quickIcon}>👤</Text>
          <Text style={styles.quickText}>Profile</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.infoText}>
        💡 Tip: Place the mineral on a plain background for best results.
      </Text>
    </ScrollView>
  );
}

const StatCard = ({ label, value, icon }: any) => (
  <View style={styles.statCard}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20 },
  welcome: { color: colors.dim, fontSize: 14 },
  email: { color: colors.gold, fontSize: 22, fontWeight: 'bold', marginTop: 4, marginBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 20,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  statIcon: { fontSize: 28 },
  statValue: { color: colors.text, fontSize: 28, fontWeight: 'bold', marginTop: 8 },
  statLabel: { color: colors.dim, fontSize: 12, marginTop: 4 },
  bigButton: {
    backgroundColor: colors.gold, borderRadius: 20, padding: 28,
    alignItems: 'center', marginBottom: 20,
  },
  bigButtonIcon: { fontSize: 40 },
  bigButtonText: { color: '#000', fontSize: 20, fontWeight: '900', letterSpacing: 2, marginTop: 12 },
  bigButtonSub: { color: '#000', fontSize: 12, marginTop: 4, opacity: 0.7 },
  quickRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  quickBtn: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 20,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  quickIcon: { fontSize: 28 },
  quickText: { color: colors.text, marginTop: 8, fontWeight: '600' },
  infoText: { color: colors.dim, fontSize: 13, textAlign: 'center', marginTop: 12 },
});
