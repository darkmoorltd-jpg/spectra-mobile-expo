import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  children: ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  padding?: number;
}

export const Card = ({ children, style, elevated, padding = 16 }: Props) => {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: elevated ? c.elevated : c.surface,
          borderColor: c.border,
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
  },
});
