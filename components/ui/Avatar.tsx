import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  name?: string;
  size?: number;
  onPress?: () => void;
  hasBadge?: boolean;
}

export const Avatar = ({ name, size = 48, onPress, hasBadge }: Props) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const initials = name
    ? name.split('@')[0].slice(0, 2).toUpperCase()
    : '?';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: c.gold + '20',
            borderColor: c.gold,
          },
        ]}
      >
        <Text style={[styles.text, { color: c.gold, fontSize: size / 2.5 }]}>{initials}</Text>
        {hasBadge && (
          <View style={[styles.badge, { backgroundColor: c.red, borderColor: c.bg }]} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  text: { fontWeight: '900' },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
});
