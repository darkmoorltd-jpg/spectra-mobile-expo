import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { predictMineral } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Button } from '../../components/ui';
import { tapFeedback, playScan } from '../../utils/feedback';

export default function ScanScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { addNotification } = useNotifications();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pick = async (fromCamera: boolean) => {
    tapFeedback();
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please enable permissions in settings.');
      return;
    }
    const res = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: false })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsEditing: false });
    if (!res.canceled && res.assets[0]) {
      setImage(res.assets[0].uri);
    }
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    playScan();
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

      // Push notification
      addNotification({
        title: pred.is_unknown ? '⚠️ Unknown Mineral' : `✅ ${pred.display_name}`,
        body: `Confidence: ${(pred.confidence * 100).toFixed(1)}%`,
        type: pred.is_unknown ? 'warning' : 'success',
      });

      // Navigate to result screen
      router.push({
        pathname: '/scan-result',
        params: { result: JSON.stringify(pred) },
      });
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || e.message || 'Failed to analyze');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bg }]} contentContainerStyle={styles.content}>
      <TouchableOpacity
        style={[styles.imageBox, { backgroundColor: c.surface, borderColor: c.gold }]}
        onPress={() => pick(true)}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <View style={[styles.cameraCircle, { borderColor: c.gold }]}>
              <Ionicons name="camera" size={48} color={c.gold} />
            </View>
            <Text style={[styles.placeholderText, { color: c.text }]}>Tap to take a photo</Text>
            <Text style={[styles.placeholderSub, { color: c.textDim }]}>
              Place mineral on plain background
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.pickBtn, { backgroundColor: c.gold }]}
          onPress={() => pick(true)}
        >
          <Ionicons name="camera" size={20} color="#000" />
          <Text style={styles.pickText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pickBtn, { backgroundColor: c.surface, borderWidth: 1, borderColor: c.gold }]}
          onPress={() => pick(false)}
        >
          <Ionicons name="images" size={20} color={c.gold} />
          <Text style={[styles.pickText, { color: c.gold }]}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {image && (
        <Button
          title={loading ? 'ANALYZING...' : 'IDENTIFY MINERAL'}
          icon="🔍"
          onPress={analyze}
          disabled={loading}
          loading={loading}
          fullWidth
          size="lg"
          style={{ marginTop: 16 }}
        />
      )}

      {image && (
        <TouchableOpacity
          onPress={() => setImage(null)}
          style={styles.clearBtn}
        >
          <Text style={{ color: c.textDim, fontSize: 13 }}>Clear photo</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  imageBox: {
    height: 320, borderRadius: 20, overflow: 'hidden',
    borderWidth: 2, borderStyle: 'dashed',
  },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraCircle: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  placeholderText: { fontSize: 17, fontWeight: '700' },
  placeholderSub: { fontSize: 13, marginTop: 4 },
  row: { flexDirection: 'row', gap: 12, marginTop: 16 },
  pickBtn: {
    flex: 1, padding: 16, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  pickText: { fontWeight: '700', fontSize: 15, color: '#000' },
  clearBtn: { alignItems: 'center', marginTop: 16 },
});
