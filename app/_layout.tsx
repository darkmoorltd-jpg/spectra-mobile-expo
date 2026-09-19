import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { NotificationProvider } from '../contexts/NotificationContext';

function InnerLayout() {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.surface },
          headerTintColor: c.gold,
          headerTitleStyle: { fontWeight: '800', letterSpacing: 0.5 },
          contentStyle: { backgroundColor: c.bg },
          headerShadowVisible: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="splash" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="checkout" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="scan-result" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="referral" options={{ headerShown: false }} />
        <Stack.Screen name="badges" options={{ headerShown: false }} />
        <Stack.Screen name="leaderboard" options={{ headerShown: false }} />
        <Stack.Screen name="alerts" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <PaperProvider>
          <InnerLayout />
        </PaperProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
