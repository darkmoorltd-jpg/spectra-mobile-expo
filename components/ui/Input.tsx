import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface Props extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  secure?: boolean;
  error?: string;
}

export const Input = ({ label, icon, secure, error, ...props }: Props) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const [hidden, setHidden] = useState(secure);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={[styles.label, { color: c.textDim }]}>{label}</Text>}
      <View
        style={[
          styles.inputBox,
          {
            backgroundColor: c.surfaceAlt,
            borderColor: error ? c.red : c.border,
          },
        ]}
      >
        {icon && <Ionicons name={icon} size={20} color={c.textDim} style={styles.icon} />}
        <TextInput
          {...props}
          secureTextEntry={hidden}
          placeholderTextColor={c.textMuted}
          style={[styles.input, { color: c.text }]}
        />
        {secure && (
          <TouchableOpacity onPress={() => setHidden(!hidden)}>
            <Ionicons name={hidden ? 'eye-off' : 'eye'} size={20} color={c.textDim} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.error, { color: c.red }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    fontSize: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: { fontSize: 12, marginTop: 4, marginLeft: 4 },
});
