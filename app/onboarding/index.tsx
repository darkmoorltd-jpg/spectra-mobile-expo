import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/theme';
import { Button } from '../../components/ui';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: 'camera',
    title: 'Scan Any Mineral',
    subtitle: 'Point your camera at any rock or ore sample. Our AI identifies it in seconds.',
    accent: colors.gold,
    gradient: ['#1A1D24', '#0A0E17'],
  },
  {
    id: '2',
    icon: 'flash',
    title: 'AI-Powered Analysis',
    subtitle: 'Trained on 1,300+ African geochemistry samples. Know exactly what you found.',
    accent: colors.cyan,
    gradient: ['#0D1B2A', '#0A0E17'],
  },
  {
    id: '3',
    icon: 'cash',
    title: 'Get Fair Market Value',
    subtitle: 'Instant Naira & USD pricing. Find buyers nearby. Get paid what your mineral is worth.',
    accent: colors.green,
    gradient: ['#0A1A0A', '#0A0E17'],
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) setCurrentIndex(viewableItems[0].index);
  }).current;

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      finish();
    }
  };

  const skip = async () => {
    await finish();
  };

  const finish = async () => {
    await AsyncStorage.setItem('spectra_onboarded', 'true');
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.skipRow}>
        <TouchableOpacity onPress={skip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={slidesRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <LinearGradient colors={item.gradient as any} style={[styles.slide, { width }]}>
            <View style={[styles.iconWrapper, { borderColor: item.accent }]}>
              <View style={[styles.iconGlow, { backgroundColor: item.accent, opacity: 0.2 }]} />
              <Ionicons name={item.icon as any} size={80} color={item.accent} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </LinearGradient>
        )}
      />

      <View style={styles.bottomSection}>
        <View style={styles.paginator}>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange, outputRange: [10, 30, 10], extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, {
                  width: dotWidth, opacity,
                  backgroundColor: i === currentIndex ? slides[i].accent : colors.border,
                }]}
              />
            );
          })}
        </View>

        <Button
          title={currentIndex === slides.length - 1 ? "GET STARTED" : "NEXT"}
          icon={currentIndex === slides.length - 1 ? "🚀" : "→"}
          onPress={scrollTo}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  skipRow: { position: 'absolute', top: 50, right: 24, zIndex: 10 },
  skipBtn: { padding: 8 },
  skipText: { color: colors.dim, fontSize: 14, fontWeight: '600' },
  slide: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconWrapper: {
    width: 180, height: 180, borderRadius: 90,
    borderWidth: 3, alignItems: 'center', justifyContent: 'center',
    marginBottom: 40,
  },
  iconGlow: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
  },
  title: {
    fontSize: 30, fontWeight: '900', color: '#fff',
    textAlign: 'center', marginBottom: 16, letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16, color: colors.dim,
    textAlign: 'center', lineHeight: 24,
  },
  bottomSection: { padding: 24, paddingBottom: 48 },
  paginator: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginBottom: 32, gap: 6,
  },
  dot: { height: 10, borderRadius: 5 },
});
