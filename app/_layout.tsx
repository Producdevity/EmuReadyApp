import React, { useEffect, createElement } from 'react'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native'
import { QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'

import {
  queryClient,
  setAuthTokenGetter,
  trpc,
  createMobileTRPCClient,
} from '@/lib/api/client'
import {
  ClerkProvider,
  tokenCache,
  CLERK_PUBLISHABLE_KEY,
  useAuthHelpers,
} from '@/lib/auth/clerk'
import { useTheme, ThemeProvider } from '@/contexts/ThemeContext'
import { useGamepadEventHandler } from '@/hooks/useGamepadNavigation'

function AppContent() {
  const { getAuthToken } = useAuthHelpers()
  const { theme } = useTheme()

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  // Initialize global gamepad event handling for Android gaming handhelds
  useGamepadEventHandler()

  useEffect(() => {
    // Connect Clerk auth token getter to API client
    setAuthTokenGetter(getAuthToken)
  }, [getAuthToken])

  useEffect(() => {
    if (loaded) {
      // SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  const navigationTheme = theme.isDark ? DarkTheme : DefaultTheme

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="listing/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="game/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="user/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  )
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ClerkProvider
        publishableKey={CLERK_PUBLISHABLE_KEY}
        tokenCache={tokenCache}
      >
        {createElement(
          (trpc as any).Provider,
          {
            client: createMobileTRPCClient(),
            queryClient: queryClient,
          },
          <QueryClientProvider client={queryClient}>
            <AppContent />
          </QueryClientProvider>,
        )}
      </ClerkProvider>
    </ThemeProvider>
  )
}
