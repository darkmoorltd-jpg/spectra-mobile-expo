import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  text: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'gold';
}

export const Badge = ({ text, variant = 'info' }: Props) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const colors = {
    success: c.green,
    warning: c.orange,
    error: c.red,
    info: c.cyan,
    gold: c.gold,
  };
  const color = colors[variant];

  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
});
