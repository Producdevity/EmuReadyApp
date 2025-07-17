import { Ionicons } from '@expo/vector-icons'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native'
import { QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { Dimensions, Platform, View } from 'react-native'
import Animated, {
  Extrapolation,
  FadeIn,
  FadeOut,
  interpolate,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import ErrorBoundary from '@/components/ErrorBoundary'
import { GradientTitle } from '@/components/themed/ThemedText'
import FluidGradient from '@/components/ui/FluidGradient'
import { FloatingElement } from '@/components/ui/MicroInteractions'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { useGamepadEventHandler } from '@/hooks/useGamepadNavigation'
import { queryClient } from '@/lib/api/client'
import { setAuthTokenGetter } from '@/lib/api/http'
import { ClerkProvider, useAuthHelpers } from '@/lib/auth/clerk'
import { tokenCache } from '@clerk/clerk-expo/token-cache'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Prevent auto-hiding of splash screen
SplashScreen.preventAutoHideAsync()

function AppContent() {
  const { getAuthToken } = useAuthHelpers()
  const { theme } = useTheme()
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false)
  const [showSplash, setShowSplash] = useState(true)

  // Enhanced 2025 animation values
  const splashProgress = useSharedValue(0)
  const logoScale = useSharedValue(0.8)
  const backgroundShift = useSharedValue(0)
  const particleFlow = useSharedValue(0)

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // Add more custom fonts for 2025 design
    'Inter-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Inter-Bold': require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  // Initialize global gamepad event handling for Android gaming handhelds
  useGamepadEventHandler()

  useEffect(() => {
    // Connect Clerk auth token getter to API client
    setAuthTokenGetter(getAuthToken)
  }, [getAuthToken])

  useEffect(() => {
    if (loaded && !showSplash) {
      SplashScreen.hideAsync().catch(console.error)
    }
  }, [loaded, showSplash])

  useEffect(() => {
    if (loaded) {
      // Initialize splash animations
      backgroundShift.value = withRepeat(
        withSequence(withTiming(1, { duration: 3000 }), withTiming(0, { duration: 3000 })),
        -1,
        true,
      )

      logoScale.value = withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(1.1, { duration: 400 }),
        withTiming(1, { duration: 300 }),
      )

      splashProgress.value = withTiming(1, { duration: 2000 }, () => {
        setSplashAnimationComplete(true)
      })

      // Trigger haptic feedback on Android
      if (Platform.OS === 'android') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }

      // Hide splash after animation
      setTimeout(() => {
        setShowSplash(false)
      }, 2500)
    }
  }, [loaded])

  const splashBackgroundStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(backgroundShift.value, [0, 1], [-50, 50], Extrapolation.CLAMP),
      },
    ],
  }))

  const splashLogoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      {
        rotate: `${interpolate(splashProgress.value, [0, 1], [0, 360], Extrapolation.CLAMP)}deg`,
      },
    ],
    opacity: interpolate(splashProgress.value, [0, 0.8, 1], [1, 1, 0], Extrapolation.CLAMP),
  }))

  if (!loaded || showSplash) {
    return (
      <View style={{ flex: 1, backgroundColor: '#111827' }}>
        {/* Revolutionary Splash Screen */}
        <Animated.View style={[{ flex: 1 }, splashBackgroundStyle]} exiting={FadeOut.duration(500)}>
          <FluidGradient variant="cosmic" animated speed="slow" style={{ flex: 1 }} opacity={0.6} />

          <LinearGradient
            colors={['rgba(94, 40, 160, 0.8)', 'rgba(17, 24, 39, 0.95)']}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Animated.View
              style={splashLogoStyle}
              entering={SlideInUp.delay(200).springify().damping(15)}
            >
              <FloatingElement intensity={4} duration={3000}>
                <View
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: 'rgba(168, 139, 250, 0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#a78bfa',
                    shadowOffset: { width: 0, height: 12 },
                    shadowOpacity: 0.6,
                    shadowRadius: 20,
                    elevation: 12,
                  }}
                >
                  <Ionicons name="game-controller" size={60} color="#a78bfa" />
                </View>
              </FloatingElement>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(600).duration(800)} style={{ marginTop: 32 }}>
              <GradientTitle
                animated
                style={{
                  fontSize: 42,
                  fontWeight: '800',
                  letterSpacing: -1,
                }}
              >
                EmuReady
              </GradientTitle>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    )
  }

  const navigationTheme = theme.isDark ? DarkTheme : DefaultTheme

  return (
    <ErrorBoundary>
      <NavigationThemeProvider value={navigationTheme}>
        <Stack
          screenOptions={{
            animation: 'slide_from_right',
            animationDuration: 250,
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="(auth)/sign-in"
            options={{
              headerShown: false,
              animation: 'slide_from_bottom',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="(auth)/sign-up"
            options={{
              headerShown: false,
              animation: 'slide_from_bottom',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="listing/[id]"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="game/[id]"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="user/[id]"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="device/[id]"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="emulator/[id]"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="hardware"
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="emulators"
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="devices"
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="media"
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="pc"
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="+not-found"
            options={{
              title: 'Not Found',
              headerStyle: {
                backgroundColor: theme.colors.card,
              },
              headerTintColor: theme.colors.text,
              animation: 'fade',
            }}
          />
        </Stack>
        <StatusBar
          style={theme.isDark ? 'light' : 'dark'}
          backgroundColor="transparent"
          translucent
        />
      </NavigationThemeProvider>
    </ErrorBoundary>
  )
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ClerkProvider tokenCache={tokenCache}>
        <QueryClientProvider client={queryClient}>
          <View style={{ flex: 1, backgroundColor: '#111827' }}>
            <AppContent />
          </View>
        </QueryClientProvider>
      </ClerkProvider>
    </ThemeProvider>
  )
}
