import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView, TouchableOpacity, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/theme';
import { Button } from '../components/ui';
import { playSuccess, playError, tapFeedback } from '../utils/feedback';

export default function ScanResultScreen() {
  const params = useLocalSearchParams();
  const result = params.result ? JSON.parse(params.result as string) : null;

  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!result) return;

    if (result.is_unknown) {
      playError();
    } else {
      playSuccess();
    }

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: result.confidence || 0,
      duration: 1200,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, [result]);

  if (!result) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.text }}>No result found</Text>
      </View>
    );
  }

  const isUnknown = result.is_unknown;
  const accentColor = isUnknown ? colors.red : colors.green;
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const shareResult = async () => {
    tapFeedback();
    try {
      await Share.share({
        message: `I identified ${result.display_name} with ${(result.confidence * 100).toFixed(1)}% confidence using Spectra AI!`,
      });
    } catch {}
  };

  const copyResult = async () => {
    tapFeedback();
    await Clipboard.setStringAsync(
      `${result.display_name} (${(result.confidence * 100).toFixed(1)}%)
Top 3: ${result.top_3?.map((t: any) => `${t.mineral} ${(t.confidence * 100).toFixed(0)}%`).join(', ')}`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HEADER */}
      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SCAN RESULT</Text>
        <TouchableOpacity onPress={shareResult} style={styles.backBtn}>
          <Ionicons name="share-outline" size={24} color={colors.gold} />
        </TouchableOpacity>
      </Animated.View>

      {/* MAIN RESULT CARD */}
      <Animated.View style={[styles.mainCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={isUnknown ? ['#2A0A0A', '#0A0E17'] : ['#0A2A0A', '#0A0E17']}
          style={[styles.cardGradient, { borderColor: accentColor }]}
        >
          <View style={[styles.iconCircle, { borderColor: accentColor }]}>
            <Text style={styles.iconText}>{isUnknown ? '❓' : '💎'}</Text>
          </View>

          <Text style={[styles.mineralName, { color: isUnknown ? colors.red : colors.gold }]}>
            {isUnknown ? 'Unknown Mineral' : result.display_name}
          </Text>

          {result.confidence !== undefined && (
            <>
              <Text style={styles.confidenceLabel}>
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </Text>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[styles.progressFill, {
                    width: progressWidth,
                    backgroundColor: accentColor,
                  }]}
                />
              </View>
            </>
          )}
        </LinearGradient>
      </Animated.View>

      {/* TOP 3 PREDICTIONS */}
      {result.top_3 && (
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>TOP PREDICTIONS</Text>
          {result.top_3.map((pred: any, i: number) => (
            <View key={i} style={styles.predRow}>
              <Text style={styles.predRank}>#{i + 1}</Text>
              <Text style={styles.predName}>{pred.mineral}</Text>
              <Text style={[styles.predConf, { color: i === 0 ? colors.gold : colors.dim }]}>
                {(pred.confidence * 100).toFixed(0)}%
              </Text>
            </View>
          ))}
        </Animated.View>
      )}

      {/* GEOROC VALIDATION */}
      {result.georoc && (
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>REGIONAL VALIDATION</Text>
          <View style={[styles.geoCard, {
            borderColor: result.georoc.region_match ? colors.green : colors.orange,
            backgroundColor: result.georoc.region_match ? '#0A2A0A' : '#2A1A0A',
          }]}>
            <Ionicons
              name={result.georoc.region_match ? 'checkmark-circle' : 'warning'}
              size={32}
              color={result.georoc.region_match ? colors.green : colors.orange}
            />
            <Text style={styles.geoText}>{result.georoc.message}</Text>
            {result.georoc.found_samples > 0 && (
              <Text style={styles.geoSub}>
                Based on {result.georoc.found_samples} nearby GEOROC samples
              </Text>
            )}
          </View>
        </Animated.View>
      )}

      {/* ACTIONS */}
      <Animated.View style={[styles.actionsSection, { opacity: fadeAnim }]}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.gold }]} onPress={copyResult}>
            <Ionicons name="copy-outline" size={22} color={colors.gold} />
            <Text style={styles.actionText}>Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.cyan }]} onPress={shareResult}>
            <Ionicons name="share-social-outline" size={22} color={colors.cyan} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.green }]} onPress={() => {}}>
            <Ionicons name="download-outline" size={22} color={colors.green} />
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="SCAN ANOTHER"
          icon="📸"
          onPress={() => router.replace('/(tabs)/scan')}
          fullWidth
          size="lg"
          style={{ marginTop: 16 }}
        />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  backBtn: { padding: 8 },
  headerTitle: {
    color: colors.text, fontSize: 14, fontWeight: '800',
    letterSpacing: 2, textTransform: 'uppercase',
  },
  mainCard: { marginBottom: 24 },
  cardGradient: {
    borderRadius: 24, borderWidth: 2,
    padding: 32, alignItems: 'center',
  },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  iconText: { fontSize: 56 },
  mineralName: {
    fontSize: 28, fontWeight: '900',
    textAlign: 'center', letterSpacing: 0.5,
  },
  confidenceLabel: { color: colors.dim, fontSize: 14, marginTop: 8 },
  progressBar: {
    width: '100%', height: 8, backgroundColor: colors.border,
    borderRadius: 4, marginTop: 12, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  section: { marginBottom: 24 },
  sectionTitle: {
    color: colors.dim, fontSize: 11, fontWeight: '800',
    letterSpacing: 2, marginBottom: 12,
  },
  predRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 12,
    padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  predRank: {
    color: colors.gold, fontWeight: '900',
    fontSize: 14, width: 32,
  },
  predName: {
    flex: 1, color: colors.text,
    fontSize: 15, fontWeight: '600', textTransform: 'capitalize',
  },
  predConf: { fontSize: 16, fontWeight: '800' },
  geoCard: {
    borderRadius: 14, borderWidth: 1,
    padding: 16, alignItems: 'center',
  },
  geoText: {
    color: colors.text, textAlign: 'center',
    marginTop: 10, fontSize: 14, fontWeight: '600',
  },
  geoSub: { color: colors.dim, fontSize: 11, marginTop: 6 },
  actionsSection: { marginTop: 8 },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 16, borderRadius: 12, borderWidth: 1.5, gap: 6,
  },
  actionText: { color: colors.text, fontSize: 12, fontWeight: '700' },
});
