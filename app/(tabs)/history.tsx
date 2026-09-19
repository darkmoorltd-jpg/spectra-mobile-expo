import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getHistory, ScanRecord } from '../../services/api';
import { colors } from '../../constants/theme';

export default function HistoryScreen() {
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await getHistory();
      setRecords(data);
    } catch (_) {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={records}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>No scans yet</Text>
          <Text style={styles.emptySub}>Start by scanning a mineral from the Scan tab.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.itemIcon}>💎</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemMineral}>{item.mineral}</Text>
            <Text style={styles.itemDate}>
              {new Date(item.created_at).toLocaleDateString('en-NG', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          </View>
          <Text style={styles.itemConf}>{(item.confidence * 100).toFixed(0)}%</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 64 },
  emptyText: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 12 },
  emptySub: { color: colors.dim, marginTop: 4, textAlign: 'center' },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderRadius: 12, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: colors.border,
  },
  itemIcon: { fontSize: 32 },
  itemMineral: { color: colors.text, fontWeight: 'bold', fontSize: 16, textTransform: 'capitalize' },
  itemDate: { color: colors.dim, fontSize: 12, marginTop: 4 },
  itemConf: { color: colors.gold, fontWeight: 'bold', fontSize: 16 },
});
