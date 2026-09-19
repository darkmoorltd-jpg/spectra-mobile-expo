import { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { predictMineral, Prediction } from '../../services/api';
import { colors } from '../../constants/theme';

export default function ScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);

  const pick = async (fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed');
      return;
    }
    const res = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: false })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsEditing: false });
    if (!res.canceled && res.assets[0]) {
      setImage(res.assets[0].uri);
      setResult(null);
    }
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      let lat, lon;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          lat = loc.coords.latitude;
          lon = loc.coords.longitude;
        }
      } catch {}

      const pred = await predictMineral(image, lat, lon);
      setResult(pred);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || e.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.imageBox} onPress={() => pick(true)}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>Tap to take a photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.row}>
        <TouchableOpacity style={[styles.pickBtn, styles.cameraBtn]} onPress={() => pick(true)}>
          <Text style={styles.pickText}>📷 Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.pickBtn, styles.galleryBtn]} onPress={() => pick(false)}>
          <Text style={styles.pickText}>🖼️ Gallery</Text>
        </TouchableOpacity>
      </View>

      {image && (
        <TouchableOpacity style={styles.analyzeBtn} onPress={analyze} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.analyzeText}>🔍 IDENTIFY MINERAL</Text>
          )}
        </TouchableOpacity>
      )}

      {result && <ResultCard result={result} />}
    </ScrollView>
  );
}

const ResultCard = ({ result }: { result: Prediction }) => {
  const isUnknown = result.is_unknown;
  const color = isUnknown ? colors.red : colors.green;

  return (
    <View style={[styles.resultCard, { borderColor: color }]}>
      <Text style={[styles.resultTitle, { color: isUnknown ? colors.red : colors.gold }]}>
        {isUnknown ? '❓ Unknown Mineral' : `💎 ${result.display_name}`}
      </Text>
      <Text style={styles.confidence}>
        Confidence: {(result.confidence * 100).toFixed(1)}%
      </Text>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${result.confidence * 100}%`, backgroundColor: color }]} />
      </View>

      {result.top_3 && (
        <>
          <Text style={styles.sectionTitle}>Top 3 predictions</Text>
          {result.top_3.map((p, i) => (
            <View key={i} style={styles.predRow}>
              <Text style={styles.predName}>{p.mineral}</Text>
              <Text style={styles.predConf}>{(p.confidence * 100).toFixed(0)}%</Text>
            </View>
          ))}
        </>
      )}

      {result.georoc && (
        <View style={[styles.geoBox, {
          backgroundColor: result.georoc.region_match ? '#0A2A0A' : '#2A0A0A',
          borderColor: result.georoc.region_match ? colors.green : colors.red,
        }]}>
          <Text style={styles.geoText}>{result.georoc.message}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  imageBox: {
    height: 300, borderRadius: 16, overflow: 'hidden',
    backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.gold,
  },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderIcon: { fontSize: 60 },
  placeholderText: { color: colors.dim, marginTop: 8 },
  row: { flexDirection: 'row', gap: 12, marginTop: 16 },
  pickBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  cameraBtn: { backgroundColor: colors.gold },
  galleryBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.gold },
  pickText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  analyzeBtn: {
    marginTop: 16, backgroundColor: colors.cyan, padding: 18,
    borderRadius: 12, alignItems: 'center',
  },
  analyzeText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  resultCard: {
    marginTop: 24, backgroundColor: colors.surface, borderRadius: 16,
    padding: 20, borderWidth: 2,
  },
  resultTitle: { fontSize: 22, fontWeight: 'bold' },
  confidence: { color: colors.dim, marginTop: 6, fontSize: 14 },
  progressBar: {
    height: 8, backgroundColor: colors.border, borderRadius: 4,
    marginTop: 10, overflow: 'hidden',
  },
  progressFill: { height: 8, borderRadius: 4 },
  sectionTitle: {
    color: colors.text, fontWeight: 'bold', marginTop: 18, marginBottom: 10,
  },
  predRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  predName: { color: colors.text, fontSize: 15 },
  predConf: { color: colors.gold, fontWeight: 'bold' },
  geoBox: {
    marginTop: 16, padding: 12, borderRadius: 10, borderWidth: 1,
  },
  geoText: { color: colors.text, fontSize: 13 },
});
