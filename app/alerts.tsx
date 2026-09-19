import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../constants/theme';
import { Button, Card } from '../components/ui';
import { getPriceAlerts, savePriceAlert, deletePriceAlert, PriceAlert } from '../utils/priceAlerts';
import { useNotifications } from '../contexts/NotificationContext';

const MINERALS = ['Gold', 'Cassiterite', 'Coltan', 'Malachite', 'Quartz', 'Pyrite'];

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [mineral, setMineral] = useState('Gold');
  const [price, setPrice] = useState('');
  const { addNotification } = useNotifications();

  useEffect(() => {
    load();
  }, []);

  const load = async () => setAlerts(await getPriceAlerts());

  const add = async () => {
    if (!price) return;
    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      mineral,
      targetPrice: parseFloat(price),
      currentPrice: 0,
      active: true,
      createdAt: new Date().toISOString(),
    };
    await savePriceAlert(newAlert);
    addNotification({
      title: '🔔 Price Alert Set',
      body: `You'll be notified when ${mineral} hits ₦${price}/kg`,
      type: 'info',
    });
    setPrice('');
    load();
  };

  const remove = async (id: string) => {
    Alert.alert('Delete alert?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deletePriceAlert(id); load(); } },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PRICE ALERTS</Text>
        <View style={{ width: 24 }} />
      </View>

      <Card style={{ marginBottom: 20 }}>
        <Text style={styles.label}>Mineral</Text>
        <View style={styles.chipsRow}>
          {MINERALS.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.chip, mineral === m && { backgroundColor: colors.gold, borderColor: colors.gold }]}
              onPress={() => setMineral(m)}
            >
              <Text style={[styles.chipText, mineral === m && { color: '#000' }]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>Alert me when price reaches (₦/kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 50000"
          placeholderTextColor={colors.dim}
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Button
          title="SET ALERT"
          icon="🔔"
          onPress={add}
          disabled={!price}
          fullWidth
          style={{ marginTop: 12 }}
        />
      </Card>

      <Text style={styles.sectionTitle}>ACTIVE ALERTS ({alerts.length})</Text>
      {alerts.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-off-outline" size={48} color={colors.dim} />
          <Text style={styles.emptyText}>No active alerts</Text>
        </View>
      ) : (
        alerts.map((a) => (
          <Card key={a.id} style={{ marginBottom: 12 }}>
            <View style={styles.alertRow}>
              <View style={[styles.alertIcon, { backgroundColor: colors.gold + '20' }]}>
                <Ionicons name="trending-up" size={20} color={colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertMineral}>{a.mineral}</Text>
                <Text style={styles.alertPrice}>Target: ₦{a.targetPrice.toLocaleString()}/kg</Text>
              </View>
              <TouchableOpacity onPress={() => remove(a.id)}>
                <Ionicons name="trash-outline" size={22} color={colors.red} />
              </TouchableOpacity>
            </View>
          </Card>
        ))
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
  label: { color: colors.dim, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt,
  },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: colors.surfaceAlt, borderRadius: 12, padding: 14,
    color: colors.text, fontSize: 16, borderWidth: 1, borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.dim, fontSize: 11, fontWeight: '800',
    letterSpacing: 2, marginTop: 20, marginBottom: 12,
  },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: colors.dim, marginTop: 12, fontSize: 14 },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  alertIcon: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  alertMineral: { color: colors.text, fontSize: 15, fontWeight: '700' },
  alertPrice: { color: colors.dim, fontSize: 12, marginTop: 2 },
});
