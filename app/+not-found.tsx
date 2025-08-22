import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { Stack, useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { StatusBar, StyleSheet, View, Pressable, Text } from 'react-native'
import Animated, {
  BounceIn,
  FadeInDown,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import { ThemedView } from '@/components/themed'
import { ThemedText } from '@/components/themed/ThemedText'
import { useTheme } from '@/contexts/ThemeContext'


export default function NotFoundScreen() {
  const router = useRouter()
  const { theme } = useTheme()

  // Simple animation values
  const glitchOffset = useSharedValue(0)

  useEffect(() => {
    // Initialize glitch effect
    glitchOffset.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 100 }),
        withTiming(-5, { duration: 100 }),
        withTiming(0, { duration: 100 }),
        withTiming(3, { duration: 100 }),
        withTiming(0, { duration: 1000 }),
      ),
      -1,
      false,
    )

    // Trigger haptic feedback
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  }, [glitchOffset])

  // Animated styles
  const glitchStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: glitchOffset.value,
      },
    ],
  }))


  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar translucent barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

        {/* Gradient Background */}
        <LinearGradient
          colors={theme.isDark ? ['rgba(239, 68, 68, 0.2)', 'rgba(17, 24, 39, 0.95)'] : ['rgba(239, 68, 68, 0.1)', 'rgba(255, 255, 255, 0.95)']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* 404 Content */}
        <ThemedView style={styles.content}>
          <Animated.View
            entering={SlideInUp.delay(200).springify().damping(15)}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
              <LinearGradient
                colors={['rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.1)']}
                style={StyleSheet.absoluteFillObject}
              />
              <BlurView intensity={40} tint={theme.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFillObject} />
              <Ionicons name="game-controller-outline" size={80} color={theme.colors.error} />
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).springify()}
            style={[styles.textContainer, glitchStyle]}
          >
            <ThemedText style={[styles.errorCode, { color: theme.colors.text }]}>
              404
            </ThemedText>

            <ThemedText style={[styles.errorTitle, { color: theme.colors.error }]}>
              Level Not Found
            </ThemedText>

            <ThemedText style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>
              Looks like this screen got lost in the digital void
            </ThemedText>
          </Animated.View>

          <Animated.View
            entering={BounceIn.delay(800).springify().damping(12)}
            style={styles.buttonContainer}
          >
            <Pressable
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                router.replace('/')
              }}
              style={styles.homeButtonWrapper}
            >
              <View style={[styles.homeButton, { backgroundColor: theme.colors.primary }]}>
                <LinearGradient
                  colors={theme.colors.gradients.primary}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.buttonContent}>
                  <Ionicons name="home" size={24} color="#ffffff" />
                  <Text style={styles.buttonText}>Return to Home</Text>
                </View>
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                void Haptics.selectionAsync()
                router.back()
              }}
              style={styles.backLinkContainer}
            >
              <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
              <Text style={[styles.backLink, { color: theme.colors.primary }]}>Go Back</Text>
            </Pressable>
          </Animated.View>
        </ThemedView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 40,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  errorCode: {
    fontSize: 96,
    fontWeight: '900',
    marginBottom: 16,
    letterSpacing: -4,
  },
  errorTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 20,
  },
  homeButtonWrapper: {
    width: '100%',
    maxWidth: 300,
  },
  homeButton: {
    height: 60,
    borderRadius: 24,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
    position: 'relative',
    zIndex: 1,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  backLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backLink: {
    fontSize: 16,
    fontWeight: '600',
  },
})
