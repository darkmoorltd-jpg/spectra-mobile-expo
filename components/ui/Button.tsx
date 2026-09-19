import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export const Button = ({
  title, onPress, variant = 'primary', size = 'md',
  loading, disabled, icon, style, fullWidth,
}: Props) => {
  const { theme } = useTheme();
  const c = theme.colors;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const sizeStyles = {
    sm: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14 },
    md: { paddingVertical: 14, paddingHorizontal: 20, fontSize: 16 },
    lg: { paddingVertical: 18, paddingHorizontal: 24, fontSize: 18 },
  }[size];

  const variantStyles: any = {
    primary: { bg: c.gold, text: '#000000', border: c.gold },
    secondary: { bg: c.cyan, text: '#000000', border: c.cyan },
    outline: { bg: 'transparent', text: c.gold, border: c.gold },
    ghost: { bg: 'transparent', text: c.text, border: 'transparent' },
    danger: { bg: c.red, text: '#FFFFFF', border: c.red },
  }[variant];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: variantStyles.bg,
          borderColor: variantStyles.border,
          ...sizeStyles,
          opacity: disabled ? 0.5 : 1,
        },
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text} />
      ) : (
        <Text style={[styles.text, { color: variantStyles.text, fontSize: sizeStyles.fontSize }]}>
          {icon ? `${icon}  ${title}` : title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
