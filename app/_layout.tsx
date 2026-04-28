import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../providers/AuthProvider';

export const unstable_settings = {
  anchor: '(tabs)',
};

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { session, isInitialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (!isInitialized) return;

    const firstSegment = segments.at(0);
    const secondSegment = segments.at(1);
    const inAuthGroup = firstSegment === '(auth)';
    const onLoginPage = inAuthGroup && secondSegment === 'login';
    const onProfilePage = inAuthGroup && secondSegment === 'profile';

    if (!session && !inAuthGroup) {
      // Not logged in and not in auth group → go to login
      router.replace('/(auth)/login');
    } else if (!session && onProfilePage) {
      // Not logged in but trying to access profile → go to login
      router.replace('/(auth)/login');
    } else if (session && onLoginPage) {
      // Logged in but on the login page → redirect to tabs
      router.replace('/(tabs)');
    }
    // If logged in and on profile page → let them stay
    // If not logged in and on login page → let them stay
  }, [session, isInitialized, segments, router]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0e0e0e', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#cafd00" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </QueryClientProvider>
  );
}
