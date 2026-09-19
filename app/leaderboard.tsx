import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../constants/theme';
import { Card } from '../components/ui';
import { getLeaderboard, LeaderboardEntry, LeaderboardPeriod } from '../utils/leaderboard';

export default function LeaderboardScreen() {
  const [period, setPeriod] = useState<LeaderboardPeriod>('week');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [period]);

  const load = async () => {
    setLoading(true);
    const data = await getLeaderboard(period);
    setEntries(data);
    setLoading(false);
  };

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LEADERBOARD</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* PERIOD TABS */}
      <View style={styles.tabsRow}>
        {(['week', 'month', 'all_time'] as LeaderboardPeriod[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodTab, period === p && { backgroundColor: colors.gold }]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && { color: '#000' }]}>
              {p === 'all_time' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      ) : (
        <>
          {/* PODIUM (TOP 3) */}
          {top3.length === 3 && (
            <View style={styles.podium}>
              {/* 2nd place */}
              <View style={[styles.podiumItem, { marginTop: 40 }]}>
                <LinearGradient colors={['#C0C0C0', '#909090']} style={styles.podiumCircle}>
                  <Text style={styles.podiumRank}>2</Text>
                </LinearGradient>
                <Text style={styles.podiumName} numberOfLines={1}>{top3[1].displayName}</Text>
                <Text style={styles.podiumScans}>{top3[1].totalScans} scans</Text>
              </View>

              {/* 1st place */}
              <View style={styles.podiumItem}>
                <Text style={styles.crown}>👑</Text>
                <LinearGradient colors={['#FFD700', '#FF9800']} style={[styles.podiumCircle, { width: 90, height: 90, borderRadius: 45 }]}>
                  <Text style={[styles.podiumRank, { fontSize: 24 }]}>1</Text>
                </LinearGradient>
                <Text style={[styles.podiumName, { fontSize: 15 }]} numberOfLines={1}>
                  {top3[0].displayName}
                </Text>
                <Text style={[styles.podiumScans, { color: colors.gold }]}>{top3[0].totalScans} scans</Text>
              </View>

              {/* 3rd place */}
              <View style={[styles.podiumItem, { marginTop: 60 }]}>
                <LinearGradient colors={['#CD7F32', '#8B4513']} style={styles.podiumCircle}>
                  <Text style={styles.podiumRank}>3</Text>
                </LinearGradient>
                <Text style={styles.podiumName} numberOfLines={1}>{top3[2].displayName}</Text>
                <Text style={styles.podiumScans}>{top3[2].totalScans} scans</Text>
              </View>
            </View>
          )}

          {/* REST OF LIST */}
          <View style={styles.listSection}>
            {rest.map((entry) => (
              <Card
                key={entry.userId}
                style={[
                  { marginBottom: 8 },
                  entry.isCurrentUser && { borderColor: colors.gold, borderWidth: 2 },
                ]}
              >
                <View style={styles.row}>
                  <Text style={styles.rank}>#{entry.rank}</Text>
                  <View style={[styles.avatar, { backgroundColor: colors.gold + '20' }]}>
                    <Text style={styles.avatarText}>
                      {entry.displayName.slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={1}>
                      {entry.displayName}
                      {entry.isCurrentUser && ' (You)'}
                    </Text>
                    <Text style={styles.sub}>
                      {entry.badges} badges · {Math.round(entry.accuracy * 100)}% accuracy
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.scans}>{entry.totalScans}</Text>
                    <Text style={styles.scansLabel}>scans</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>

          {/* YOUR RANK */}
          {entries.find((e) => e.isCurrentUser) && (
            <Card style={{ marginTop: 20, backgroundColor: colors.gold + '10', borderColor: colors.gold }}>
              <Text style={{ color: colors.dim, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                Your Rank
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 }}>
                <Text style={{ color: colors.gold, fontSize: 32, fontWeight: '900' }}>
                  #{entries.find((e) => e.isCurrentUser)?.rank}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>
                    Keep scanning to climb!
                  </Text>
                  <Text style={{ color: colors.dim, fontSize: 12, marginTop: 2 }}>
                    You're in the top {100 - Math.round((entries.find((e) => e.isCurrentUser)?.rank || 100) / entries.length * 100)}%
                  </Text>
                </View>
              </View>
            </Card>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 60 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  headerTitle: {
    color: colors.text, fontSize: 14, fontWeight: '800',
    letterSpacing: 2, textTransform: 'uppercase',
  },
  center: { paddingVertical: 60, alignItems: 'center' },
  tabsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  periodTab: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    backgroundColor: colors.surface, borderWidth: 1,
    borderColor: colors.border, alignItems: 'center',
  },
  periodText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  podium: {
    flexDirection: 'row', justifyContent: 'space-around',
    alignItems: 'flex-end', marginBottom: 32, paddingHorizontal: 10,
  },
  podiumItem: { alignItems: 'center', flex: 1 },
  crown: { fontSize: 24, marginBottom: 4 },
  podiumCircle: {
    width: 70, height: 70, borderRadius: 35,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#000',
  },
  podiumRank: { color: '#000', fontSize: 20, fontWeight: '900' },
  podiumName: {
    color: colors.text, fontSize: 12, fontWeight: '700',
    marginTop: 8, textAlign: 'center',
  },
  podiumScans: { color: colors.dim, fontSize: 11, marginTop: 2 },
  listSection: { marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rank: {
    color: colors.gold, fontSize: 16,
    fontWeight: '900', width: 44,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.gold, fontSize: 16, fontWeight: '900' },
  name: { color: colors.text, fontSize: 14, fontWeight: '700' },
  sub: { color: colors.dim, fontSize: 11, marginTop: 2 },
  scans: { color: colors.text, fontSize: 16, fontWeight: '800' },
  scansLabel: { color: colors.dim, fontSize: 10, textTransform: 'uppercase' },
});
