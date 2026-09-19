import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const { session, loading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate entry
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 800, useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1, friction: 4, tension: 40, useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1, duration: 1200, useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ])
      ),
    ]).start();

    // Route after animation
    const timer = setTimeout(async () => {
      if (loading) return;
      const onboarded = await AsyncStorage.getItem('spectra_onboarded');
      if (session) {
        router.replace('/(tabs)/home');
      } else if (!onboarded) {
        router.replace('/onboarding');
      } else {
        router.replace('/(auth)/login');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [loading, session]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  return (
    <LinearGradient colors={['#0A0E17', '#0D1B2A', '#0A0E17']} style={styles.container}>
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { rotate: rotation }],
          },
        ]}
      >
        <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>💎</Text>
        </View>
      </Animated.View>

      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
        SPECTRA
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
        MINERAL INTELLIGENCE
      </Animated.Text>

      <Animated.View style={[styles.loadingBar, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.loadingFill, { width: '70%' }]} />
      </Animated.View>

      <Animated.Text style={[styles.footer, { opacity: fadeAnim }]}>
        Powered by Darkmoor Ltd · 🇳🇬
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoWrapper: { marginBottom: 40, alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: colors.gold, opacity: 0.3,
  },
  logoCircle: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: colors.surface,
    borderWidth: 3, borderColor: colors.gold,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.gold, shadowOpacity: 0.6,
    shadowRadius: 20, shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  logoIcon: { fontSize: 72 },
  title: {
    fontSize: 42, fontWeight: '900', color: colors.gold,
    letterSpacing: 8, marginBottom: 8,
  },
  subtitle: {
    fontSize: 12, color: colors.dim,
    letterSpacing: 6, marginBottom: 60,
  },
  loadingBar: {
    width: 200, height: 3, backgroundColor: colors.border,
    borderRadius: 2, overflow: 'hidden', marginBottom: 20,
  },
  loadingFill: { height: '100%', backgroundColor: colors.gold },
  footer: { position: 'absolute', bottom: 40, color: colors.dim, fontSize: 11 },
});
