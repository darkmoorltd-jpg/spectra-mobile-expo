import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, Button, Avatar, Badge } from '../../components/ui';
import { isBiometricAvailable, isBiometricEnabled, setBiometricEnabled } from '../../utils/biometric';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const c = theme.colors;
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      setBioAvailable(await isBiometricAvailable());
      setBioEnabled(await isBiometricEnabled());
    })();
  }, []);

  const toggleBio = async (value: boolean) => {
    if (value && !bioAvailable) {
      Alert.alert('Not Available', 'Biometric authentication is not set up on this device.');
      return;
    }
    await setBiometricEnabled(value);
    setBioEnabled(value);
  };

  const logout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const SettingRow = ({ icon, label, value, onPress, right }: any) => (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: c.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: c.gold + '20' }]}>
        <Ionicons name={icon} size={20} color={c.gold} />
      </View>
      <Text style={[styles.rowLabel, { color: c.text }]}>{label}</Text>
      {right || (value && <Text style={[styles.rowValue, { color: c.textDim }]}>{value}</Text>)}
      {onPress && <Ionicons name="chevron-forward" size={20} color={c.textMuted} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bg }]} contentContainerStyle={styles.content}>
      {/* HEADER CARD */}
      <Card style={styles.headerCard}>
        <View style={styles.headerInner}>
          <Avatar name={user?.email} size={72} />
          <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
            {user?.email?.split('@')[0] || 'Miner'}
          </Text>
          <Text style={[styles.email, { color: c.textDim }]}>{user?.email}</Text>
          <View style={styles.badgeRow}>
            <Badge text="Free Plan" variant="gold" />
            <Badge text="Verified" variant="success" />
          </View>
        </View>
      </Card>

      {/* ACCOUNT */}
      <Text style={[styles.sectionTitle, { color: c.textDim }]}>Account</Text>
      <Card style={{ padding: 0 }}>
        <SettingRow icon="person-outline" label="Edit Profile" onPress={() => {}} />
        <SettingRow icon="card-outline" label="Buy Scans" onPress={() => {}} />
        <SettingRow icon="receipt-outline" label="Payment History" onPress={() => {}} />
      </Card>

      {/* PREFERENCES */}
      <Text style={[styles.sectionTitle, { color: c.textDim }]}>Preferences</Text>
      <Card style={{ padding: 0 }}>
        <SettingRow
          icon={theme.mode === 'dark' ? 'moon' : 'sunny'}
          label="Dark Mode"
          right={<Switch value={theme.mode === 'dark'} onValueChange={toggleTheme} trackColor={{ true: c.gold, false: c.border }} thumbColor={c.gold} />}
        />
        <SettingRow
          icon="finger-print"
          label="Fingerprint Lock"
          right={<Switch value={bioEnabled} onValueChange={toggleBio} trackColor={{ true: c.gold, false: c.border }} thumbColor={c.gold} />}
        />
        <SettingRow
          icon="notifications-outline"
          label="Push Notifications"
          right={<Switch value={true} trackColor={{ true: c.gold, false: c.border }} thumbColor={c.gold} />}
        />
        <SettingRow icon="language-outline" label="Language" value="English" onPress={() => {}} />
      </Card>

      {/* SUPPORT */}
      <Text style={[styles.sectionTitle, { color: c.textDim }]}>Support</Text>
      <Card style={{ padding: 0 }}>
        <SettingRow icon="help-circle-outline" label="Help Center" onPress={() => {}} />
        <SettingRow icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => {}} />
        <SettingRow icon="information-circle-outline" label="About" value="v1.0.0" onPress={() => {}} />
      </Card>

      {/* LOGOUT */}
      <Button
        title="SIGN OUT"
        icon="🚪"
        variant="danger"
        onPress={logout}
        fullWidth
        style={{ marginTop: 24 }}
      />

      <Text style={[styles.footer, { color: c.textMuted }]}>
        Made in Nigeria 🇳🇬 · Powered by Darkmoor Ltd
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  headerCard: { marginBottom: 24 },
  headerInner: { alignItems: 'center', paddingVertical: 12 },
  name: { fontSize: 22, fontWeight: '800', marginTop: 12, textTransform: 'capitalize' },
  email: { fontSize: 13, marginTop: 4 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    textTransform: 'uppercase', marginTop: 20, marginBottom: 8, marginLeft: 4,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, gap: 12,
  },
  rowIcon: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  rowValue: { fontSize: 13 },
  footer: { textAlign: 'center', fontSize: 12, marginTop: 24 },
});
