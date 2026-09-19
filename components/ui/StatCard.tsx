import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  icon: string;
  value: string | number;
  label: string;
  accent?: string;
}

export const StatCard = ({ icon, value, label, accent }: Props) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const color = accent || c.gold;

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.value, { color: c.text }]}>{value}</Text>
      <Text style={[styles.label, { color: c.textDim }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: { fontSize: 24 },
  value: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  label: { fontSize: 11, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
});
