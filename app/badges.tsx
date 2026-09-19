import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../constants/theme';
import { Card } from '../components/ui';
import { getBadgesByCategory, getUnlockedBadges, ALL_BADGES, Badge } from '../utils/badges';

type Category = 'all' | 'scan' | 'streak' | 'social' | 'market';

export default function BadgesScreen() {
  const [category, setCategory] = useState<Category>('all');
  const [badges, setBadges] = useState<(Badge & { unlocked: boolean })[]>([]);
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const grouped = await getBadgesByCategory();
    setBadges([...grouped.scan, ...grouped.streak, ...grouped.social, ...grouped.market]);
    const unlocked = await getUnlockedBadges();
    setUnlockedCount(unlocked.length);
  };

  const filtered = category === 'all' ? badges : badges.filter((b) => b.category === category);
  const progress = unlockedCount / ALL_BADGES.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ACHIEVEMENTS</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* PROGRESS CARD */}
      <Card style={{ marginBottom: 20 }}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressCount}>{unlockedCount} / {ALL_BADGES.length}</Text>
            <Text style={styles.progressLabel}>Badges Unlocked</Text>
          </View>
          <View style={[styles.trophyCircle, { borderColor: colors.gold }]}>
            <Text style={{ fontSize: 32 }}>🏆</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressPercent}>{Math.round(progress * 100)}% complete</Text>
      </Card>

      {/* CATEGORY TABS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {(['all', 'scan', 'streak', 'social', 'market'] as Category[]).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.tab, category === cat && { backgroundColor: colors.gold }]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.tabText, category === cat && { color: '#000' }]}>
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* BADGES GRID */}
      <View style={styles.grid}>
        {filtered.map((badge) => (
          <View key={badge.id} style={styles.badgeCard}>
            <View style={[
              styles.badgeIconBox,
              {
                backgroundColor: badge.unlocked ? badge.color + '20' : colors.surfaceAlt,
                borderColor: badge.unlocked ? badge.color : colors.border,
              },
            ]}>
              <Text style={[styles.badgeIcon, !badge.unlocked && { opacity: 0.3 }]}>
                {badge.unlocked ? badge.icon : '🔒'}
              </Text>
            </View>
            <Text
              style={[styles.badgeName, { color: badge.unlocked ? colors.text : colors.dim }]}
              numberOfLines={2}
            >
              {badge.name}
            </Text>
            <Text style={styles.badgeReq} numberOfLines={2}>
              {badge.requirement}
            </Text>
            {badge.unlocked && (
              <View style={[styles.unlockedTag, { backgroundColor: badge.color + '30' }]}>
                <Text style={[styles.unlockedText, { color: badge.color }]}>✓</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* MOTIVATION */}
      <Card style={{ marginTop: 20, backgroundColor: colors.gold + '10' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 28 }}>💡</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>
              Keep scanning to unlock more!
            </Text>
            <Text style={{ color: colors.dim, fontSize: 12, marginTop: 4 }}>
              Every badge gives you exclusive perks and bonus scans.
            </Text>
          </View>
        </View>
      </Card>
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
  progressHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  progressCount: { color: colors.gold, fontSize: 28, fontWeight: '900' },
  progressLabel: { color: colors.dim, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  trophyCircle: {
    width: 64, height: 64, borderRadius: 32, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.gold + '10',
  },
  progressBar: {
    height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.gold, borderRadius: 4 },
  progressPercent: { color: colors.dim, fontSize: 11, marginTop: 8, textAlign: 'right' },
  tab: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20,
    borderWidth: 1, borderColor: colors.border, marginRight: 8,
    backgroundColor: colors.surface,
  },
  tabText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeCard: {
    width: '47%', backgroundColor: colors.surface,
    borderRadius: 16, borderWidth: 1, borderColor: colors.border,
    padding: 16, alignItems: 'center', position: 'relative',
  },
  badgeIconBox: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  badgeIcon: { fontSize: 32 },
  badgeName: { fontSize: 13, fontWeight: '800', textAlign: 'center' },
  badgeReq: { fontSize: 11, color: colors.dim, textAlign: 'center', marginTop: 4 },
  unlockedTag: {
    position: 'absolute', top: 8, right: 8,
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  unlockedText: { fontSize: 12, fontWeight: '900' },
});
