import { GlowText, GradientTitle, TypewriterText } from '@/components/themed/ThemedText'
import { HolographicView, MagneticView } from '@/components/themed/ThemedView'
import FluidGradient from '@/components/ui/FluidGradient'
import {
  AnimatedPressable,
  FloatingElement,
  MICRO_SPRING_CONFIG,
} from '@/components/ui/MicroInteractions'
import { useTheme } from '@/contexts/ThemeContext'
import { useSignIn } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'
import Animated, {
  BounceIn,
  Extrapolation,
  interpolate,
  runOnJS,
  SlideInLeft,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT

export default function SignInScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const { signIn, setActive, isLoaded } = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Enhanced 2025 animation values
  const heroGlow = useSharedValue(0)
  const formFloat = useSharedValue(0)
  const backgroundShift = useSharedValue(0)
  const buttonPulse = useSharedValue(1)
  const particleFlow = useSharedValue(0)
  const logoScale = useSharedValue(0.8)

  useEffect(() => {
    // Initialize cosmic background animation
    backgroundShift.value = withRepeat(
      withSequence(withTiming(1, { duration: 20000 }), withTiming(0, { duration: 20000 })),
      -1,
      true,
    )

    // Hero glow animation
    heroGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 3000 }), withTiming(0.2, { duration: 3000 })),
      -1,
      true,
    )

    // Form floating animation
    // formFloat.value = withRepeat(
    //   withSequence(withTiming(10, { duration: 6000 }), withTiming(-10, { duration: 6000 })),
    //   -1,
    //   true,
    // )

    // Button pulse animation - DISABLED
    // buttonPulse.value = withRepeat(
    //   withSequence(
    //     withSpring(1.02, MICRO_SPRING_CONFIG.bouncy),
    //     withSpring(1, MICRO_SPRING_CONFIG.smooth),
    //   ),
    //   -1,
    //   true,
    // )

    // Particle flow animation
    particleFlow.value = withRepeat(withTiming(1, { duration: 12000 }), -1, false)

    // Logo entrance animation
    logoScale.value = withSpring(1, MICRO_SPRING_CONFIG.bouncy)
  }, [backgroundShift, buttonPulse, formFloat, heroGlow, logoScale, particleFlow])

  const handleSignIn = async () => {
    if (!isLoaded) return

    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password.')
      return
    }

    setIsLoading(true)
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/(tabs)')
      } else {
        Alert.alert('Error', 'Sign in failed. Please check your credentials.')
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      Alert.alert('Error', error.errors?.[0]?.message || 'Failed to sign in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = () => {
    router.push('/(auth)/sign-up')
  }

  // Animated styles
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(backgroundShift.value, [0, 1], [-80, 80], Extrapolation.CLAMP),
      },
    ],
  }))

  const heroGlowStyle = useAnimatedStyle(() => ({
    opacity: heroGlow.value,
  }))

  const formFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: 0 }],
  }))

  const buttonPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 }],
  }))

  const logoScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }))

  const particleFlowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          particleFlow.value,
          [0, 1],
          [-200, SCREEN_WIDTH + 200],
          Extrapolation.CLAMP,
        ),
      },
    ],
    opacity: interpolate(particleFlow.value, [0, 0.2, 0.8, 1], [0, 1, 1, 0], Extrapolation.CLAMP),
  }))

  return (
    <View style={styles.container}>
      <StatusBar translucent />

      {/* Revolutionary Cosmic Background */}
      <Animated.View style={[StyleSheet.absoluteFillObject, backgroundAnimatedStyle]}>
        <FluidGradient
          variant="cosmic"
          animated
          speed="slow"
          style={StyleSheet.absoluteFillObject}
          opacity={0.4}
        />
      </Animated.View>

      {/* Enhanced Gradient Overlay */}
      <LinearGradient
        colors={['rgba(94, 40, 160, 0.8)', 'rgba(17, 24, 39, 0.95)']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating Particles - optimized for landscape */}
      <Animated.View style={[styles.particle, { top: '20%' }, particleFlowStyle]}>
        <View style={[styles.particleDot, { backgroundColor: '#a78bfa' }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, { top: '50%' }, particleFlowStyle]}>
        <View style={[styles.particleDot, { backgroundColor: '#c084fc' }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, { top: '80%' }, particleFlowStyle]}>
        <View style={[styles.particleDot, { backgroundColor: '#e879f9' }]} />
      </Animated.View>

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              isLandscape && styles.scrollContentLandscape,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Header */}
            <Animated.View
              entering={SlideInLeft.delay(200).springify().damping(15)}
              style={[styles.header, heroGlowStyle]}
            >
              {/* Logo/Icon */}
              <Animated.View style={logoScaleStyle}>
                <FloatingElement intensity={3} duration={4000}>
                  <MagneticView borderRadius={40} style={styles.logoContainer}>
                    <LinearGradient
                      colors={theme.colors.gradients.primary}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <Ionicons name="game-controller" size={48} color="#ffffff" />
                  </MagneticView>
                </FloatingElement>
              </Animated.View>

              <GradientTitle animated style={styles.title}>
                Welcome Back
              </GradientTitle>

              <TypewriterText animated delay={400} style={styles.subtitle}>
                Sign in to continue your gaming journey
              </TypewriterText>
            </Animated.View>

            {/* Enhanced Sign In Form - Gamepad Optimized */}
            <Animated.View
              entering={BounceIn.delay(600).springify().damping(12)}
              style={formFloatStyle}
            >
              <HolographicView
                morphing
                borderRadius={32}
                style={[styles.signInCard, isLandscape && styles.signInCardLandscape]}
              >
                <FluidGradient
                  variant="gaming"
                  borderRadius={32}
                  animated
                  speed="normal"
                  style={StyleSheet.absoluteFillObject}
                  opacity={0.08}
                />

                <View style={styles.cardContent}>
                  <GlowText type="title" style={styles.cardTitle}>
                    Sign In
                  </GlowText>

                  <TypewriterText animated delay={700} style={styles.cardSubtitle}>
                    Enter your credentials to access your EmuReady profile
                  </TypewriterText>

                  <View style={styles.formContainer}>
                    {/* Email Input */}
                    <View style={styles.inputWrapper}>
                      <GlowText style={styles.inputLabel}>Email</GlowText>
                      <MagneticView borderRadius={16} style={styles.inputContainer}>
                        <BlurView
                          intensity={60}
                          tint="dark"
                          style={StyleSheet.absoluteFillObject}
                        />
                        <View style={styles.inputInner}>
                          <Ionicons name="mail" size={20} color={theme.colors.primary} />
                          <TextInput
                            style={styles.input}
                            placeholder="player@emuready.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            placeholderTextColor={theme.colors.textMuted}
                          />
                        </View>
                      </MagneticView>
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputWrapper}>
                      <GlowText style={styles.inputLabel}>Password</GlowText>
                      <MagneticView borderRadius={16} style={styles.inputContainer}>
                        <BlurView
                          intensity={60}
                          tint="dark"
                          style={StyleSheet.absoluteFillObject}
                        />
                        <View style={styles.inputInner}>
                          <Ionicons name="lock-closed" size={20} color={theme.colors.primary} />
                          <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                            placeholderTextColor={theme.colors.textMuted}
                          />
                        </View>
                      </MagneticView>
                    </View>

                    {/* Sign In Button */}
                    <Animated.View style={buttonPulseStyle}>
                      <AnimatedPressable
                        onPress={() => {
                          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium)
                          handleSignIn()
                        }}
                        style={styles.signInButtonWrapper}
                      >
                        <MagneticView borderRadius={20} style={styles.signInButton}>
                          <LinearGradient
                            colors={theme.colors.gradients.primary}
                            style={StyleSheet.absoluteFillObject}
                          />
                          <View style={styles.buttonContent}>
                            {isLoading ? (
                              <ActivityIndicator color="#ffffff" />
                            ) : (
                              <>
                                <GlowText style={styles.buttonText}>Launch Session</GlowText>
                                <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                              </>
                            )}
                          </View>
                        </MagneticView>
                      </AnimatedPressable>
                    </Animated.View>

                    {/* Sign Up Link */}
                    <View style={styles.signUpContainer}>
                      <TypewriterText animated delay={800} style={styles.signUpText}>
                        New player?
                      </TypewriterText>
                      <AnimatedPressable
                        onPress={() => {
                          runOnJS(Haptics.selectionAsync)()
                          handleSignUp()
                        }}
                      >
                        <GlowText style={styles.signUpLink}>Create Account</GlowText>
                      </AnimatedPressable>
                    </View>
                  </View>
                </View>
              </HolographicView>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  particle: {
    position: 'absolute',
  },
  particleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  scrollContentLandscape: {
    paddingHorizontal: '15%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#6d28d9',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: '#e9d5ff',
    textAlign: 'center',
    lineHeight: 26,
  },
  signInCard: {
    marginHorizontal: 20,
    padding: 32,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(94, 40, 160, 0.1)',
  },
  signInCardLandscape: {
    marginHorizontal: 40,
  },
  cardContent: {
    position: 'relative',
    zIndex: 1,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#e9d5ff',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 24,
  },
  formContainer: {
    gap: 20,
  },
  inputWrapper: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e9d5ff',
    marginBottom: 10,
    marginLeft: 4,
  },
  inputContainer: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'relative',
    zIndex: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
  signInButtonWrapper: {
    marginTop: 8,
  },
  signInButton: {
    height: 56,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6d28d9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    position: 'relative',
    zIndex: 1,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 6,
  },
  signUpText: {
    fontSize: 15,
    color: '#e9d5ff',
  },
  signUpLink: {
    fontSize: 15,
    fontWeight: '600',
    color: '#a78bfa',
  },
})
