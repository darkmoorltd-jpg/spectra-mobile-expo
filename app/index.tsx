import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../constants/theme';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return session ? <Redirect href="/(tabs)/home" /> : <Redirect href="/(auth)/login" />;
}
