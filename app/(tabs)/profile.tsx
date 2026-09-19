import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../constants/theme';

export default function ProfileScreen() {
  const { user } = useAuth();

  const logout = async () => {
    Alert.alert('Sign Out', 'Are you sure?', [
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

  return (
    <View style={styles.container}>
      <View style={styles.avatarBox}>
        <Text style={styles.avatar}>👤</Text>
      </View>
      <Text style={styles.email}>{user?.email || 'Not logged in'}</Text>
      <Text style={styles.id}>ID: {user?.id?.slice(0, 12)}...</Text>

      <View style={styles.card}>
        <Row label="Member since" value={new Date(user?.created_at || Date.now()).toLocaleDateString()} />
        <Row label="Plan" value="Free" />
        <Row label="App version" value="1.0.0" />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>🚪 SIGN OUT</Text>
      </TouchableOpacity>
    </View>
  );
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  avatarBox: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: colors.surface,
    alignSelf: 'center', justifyContent: 'center', alignItems: 'center',
    marginTop: 24, borderWidth: 2, borderColor: colors.gold,
  },
  avatar: { fontSize: 48 },
  email: { color: colors.text, textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  id: { color: colors.dim, textAlign: 'center', fontSize: 12, marginTop: 4, marginBottom: 24 },
  card: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  rowLabel: { color: colors.dim, fontSize: 14 },
  rowValue: { color: colors.text, fontSize: 14, fontWeight: '600' },
  logoutBtn: {
    backgroundColor: colors.red, borderRadius: 12, padding: 18,
    alignItems: 'center', marginTop: 32,
  },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});
