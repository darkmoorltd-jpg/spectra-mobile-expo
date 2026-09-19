import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../constants/theme';
import { Button, Card } from '../components/ui';
import { getMyReferralStats, REWARD_PER_REFERRAL, getReferredUsers, Referral } from '../utils/referral';
import { tapFeedback } from '../utils/feedback';

export default function ReferralScreen() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const s = await getMyReferralStats();
      setStats(s);
      setUsers(await getReferredUsers());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const shareLink = async () => {
    tapFeedback();
    if (!stats) return;
    try {
      await Share.share({
        message: `🎉 Join Spectra AI — the AI that identifies minerals instantly!

Use my code: ${stats.code}
Or click: ${stats.referralLink}

We both get ${REWARD_PER_REFERRAL} free scans! 🎁`,
      });
    } catch {}
  };

  const copyCode = async () => {
    tapFeedback();
    if (!stats) return;
    await Clipboard.setStringAsync(stats.code);
    Alert.alert('Copied!', `Code ${stats.code} copied to clipboard`);
  };

  const copyLink = async () => {
    tapFeedback();
    if (!stats) return;
    await Clipboard.setStringAsync(stats.referralLink);
    Alert.alert('Copied!', 'Referral link copied');
  };

  if (loading || !stats) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.dim }}>Loading referral info...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>REFER & EARN</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* HERO */}
      <LinearGradient
        colors={['#FFD700', '#FF9800']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroEmoji}>🎁</Text>
        <Text style={styles.heroTitle}>Get {REWARD_PER_REFERRAL} Free Scans</Text>
        <Text style={styles.heroSubtitle}>
          For every friend who joins Spectra AI, you both get {REWARD_PER_REFERRAL} free scans!
        </Text>
      </LinearGradient>

      {/* MY CODE */}
      <Text style={styles.sectionTitle}>YOUR REFERRAL CODE</Text>
      <Card style={{ marginBottom: 20 }}>
        <TouchableOpacity onPress={copyCode} style={styles.codeRow} activeOpacity={0.7}>
          <View style={{ flex: 1 }}>
            <Text style={styles.codeLabel}>Your unique code</Text>
            <Text style={styles.codeText}>{stats.code}</Text>
          </View>
          <View style={styles.copyIconBtn}>
            <Ionicons name="copy" size={20} color={colors.gold} />
          </View>
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <TouchableOpacity onPress={copyLink} style={styles.codeRow} activeOpacity={0.7}>
          <View style={{ flex: 1 }}>
            <Text style={styles.codeLabel}>Referral link</Text>
            <Text style={styles.linkText} numberOfLines={1}>{stats.referralLink}</Text>
          </View>
          <View style={styles.copyIconBtn}>
            <Ionicons name="link" size={20} color={colors.cyan} />
          </View>
        </TouchableOpacity>
      </Card>

      {/* SHARE BUTTON */}
      <Button
        title="SHARE WITH FRIENDS"
        icon="📤"
        onPress={shareLink}
        fullWidth
        size="lg"
        style={{ marginBottom: 24 }}
      />

      {/* STATS */}
      <Text style={styles.sectionTitle}>YOUR STATS</Text>
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
          <Text style={styles.statNum}>{stats.totalReferrals}</Text>
          <Text style={styles.statLabel}>Referrals</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statNum, { color: colors.green }]}>{stats.activeReferrals}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statNum, { color: colors.gold }]}>{stats.totalScansEarned}</Text>
          <Text style={styles.statLabel}>Scans Earned</Text>
        </View>
      </View>

      {/* REFERRED USERS */}
      <Text style={styles.sectionTitle}>FRIENDS YOU REFERRED ({users.length})</Text>
      {users.length === 0 ? (
        <Card>
          <View style={styles.emptyBox}>
            <Ionicons name="people-outline" size={48} color={colors.dim} />
            <Text style={styles.emptyText}>No referrals yet</Text>
            <Text style={styles.emptySub}>
              Share your code and start earning free scans!
            </Text>
          </View>
        </Card>
      ) : (
        users.map((u) => (
          <Card key={u.id} style={{ marginBottom: 10 }}>
            <View style={styles.userRow}>
              <View style={[styles.userAvatar, { backgroundColor: colors.gold + '20' }]}>
                <Text style={{ fontSize: 20 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{u.code}</Text>
                <Text style={styles.userDate}>
                  {new Date(u.joinedAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={[styles.statusBadge, {
                backgroundColor: u.status === 'rewarded' ? colors.green + '20' : colors.orange + '20',
              }]}>
                <Text style={[styles.statusText, {
                  color: u.status === 'rewarded' ? colors.green : colors.orange,
                }]}>
                  {u.status.toUpperCase()}
                </Text>
              </View>
            </View>
          </Card>
        ))
      )}

      {/* HOW IT WORKS */}
      <Text style={styles.sectionTitle}>HOW IT WORKS</Text>
      <Card>
        <Step n={1} text="Share your unique code or link with friends" />
        <Step n={2} text="They sign up and use Spectra AI" />
        <Step n={3} text={`You BOTH get ${REWARD_PER_REFERRAL} free scans instantly`} />
        <Step n={4} text="Keep referring to earn unlimited scans" isLast />
      </Card>
    </ScrollView>
  );
}

const Step = ({ n, text, isLast }: { n: number; text: string; isLast?: boolean }) => (
  <View style={[styles.stepRow, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
    <View style={styles.stepNum}>
      <Text style={styles.stepNumText}>{n}</Text>
    </View>
    <Text style={styles.stepText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  headerTitle: {
    color: colors.text, fontSize: 14, fontWeight: '800',
    letterSpacing: 2, textTransform: 'uppercase',
  },
  hero: {
    borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 24,
  },
  heroEmoji: { fontSize: 56 },
  heroTitle: { color: '#000', fontSize: 24, fontWeight: '900', marginTop: 12 },
  heroSubtitle: {
    color: '#000', fontSize: 14, textAlign: 'center',
    marginTop: 8, opacity: 0.8, lineHeight: 20,
  },
  sectionTitle: {
    color: colors.dim, fontSize: 11, fontWeight: '800',
    letterSpacing: 2, marginBottom: 12, marginTop: 8,
  },
  codeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  codeLabel: { color: colors.dim, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  codeText: { color: colors.gold, fontSize: 22, fontWeight: '900', letterSpacing: 2, marginTop: 4 },
  linkText: { color: colors.cyan, fontSize: 13, marginTop: 4 },
  copyIconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  divider: { height: 1, marginVertical: 12 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statBox: {
    flex: 1, padding: 16, borderRadius: 14,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  statNum: { fontSize: 24, fontWeight: '900', color: colors.text },
  statLabel: { color: colors.dim, fontSize: 11, marginTop: 4, textTransform: 'uppercase' },
  emptyBox: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { color: colors.text, fontSize: 15, fontWeight: '700', marginTop: 12 },
  emptySub: { color: colors.dim, fontSize: 13, marginTop: 6, textAlign: 'center' },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  userAvatar: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  userName: { color: colors.text, fontSize: 14, fontWeight: '700' },
  userDate: { color: colors.dim, fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  stepNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { color: '#000', fontWeight: '900', fontSize: 13 },
  stepText: { color: colors.text, flex: 1, fontSize: 14, lineHeight: 20 },
});
