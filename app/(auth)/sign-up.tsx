import { GlowText, GradientTitle, TypewriterText } from '@/components/themed/ThemedText'
import { HolographicView, MagneticView } from '@/components/themed/ThemedView'
import FluidGradient from '@/components/ui/FluidGradient'
import {
  AnimatedPressable,
  FloatingElement,
  MICRO_SPRING_CONFIG,
} from '@/components/ui/MicroInteractions'
import { useTheme } from '@/contexts/ThemeContext'
import { useSignUp } from '@clerk/clerk-expo'
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
  SlideInRight,
  ZoomIn,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT

export default function SignUpScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const { signUp, setActive, isLoaded } = useSignUp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')

  // Enhanced 2025 animation values
  const heroGlow = useSharedValue(0)
  const formFloat = useSharedValue(0)
  const backgroundShift = useSharedValue(0)
  const buttonPulse = useSharedValue(1)
  const particleFlow = useSharedValue(0)
  const logoRotate = useSharedValue(0)
  const codeInputScale = useSharedValue(1)

  useEffect(() => {
    // Initialize cosmic background animation
    backgroundShift.value = withRepeat(
      withSequence(withTiming(1, { duration: 25000 }), withTiming(0, { duration: 25000 })),
      -1,
      true,
    )

    // Hero glow animation
    heroGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 3500 }), withTiming(0.2, { duration: 3500 })),
      -1,
      true,
    )

    // Form floating animation
    // formFloat.value = withRepeat(
    //   withSequence(withTiming(12, { duration: 6500 }), withTiming(-12, { duration: 6500 })),
    //   -1,
    //   true,
    // )

    // Button pulse animation - DISABLED
    // buttonPulse.value = withRepeat(
    //   withSequence(
    //     withSpring(1.03, MICRO_SPRING_CONFIG.bouncy),
    //     withSpring(1, MICRO_SPRING_CONFIG.smooth),
    //   ),
    //   -1,
    //   true,
    // )

    // Particle flow animation
    particleFlow.value = withRepeat(withTiming(1, { duration: 14000 }), -1, false)

    // Logo rotation animation - DISABLED
    // logoRotate.value = withRepeat(withTiming(360, { duration: 20000 }), -1, false)
  }, [backgroundShift, buttonPulse, formFloat, heroGlow, logoRotate, particleFlow])

  const handleSignUp = async () => {
    if (!isLoaded) return

    if (!email.trim() || !password.trim() || !firstName.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.')
      return
    }

    setIsLoading(true)
    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      })

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (error: any) {
      console.error('Sign up error:', error)
      Alert.alert(
        'Error',
        error.errors?.[0]?.message || 'Failed to create account. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerification = async () => {
    if (!isLoaded) return

    setIsLoading(true)
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/(tabs)')
      } else {
        Alert.alert('Error', 'Verification failed. Please check your code.')
      }
    } catch (error: any) {
      console.error('Verification error:', error)
      Alert.alert('Error', error.errors?.[0]?.message || 'Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = () => {
    router.push('/(auth)/sign-in')
  }

  // Animated styles
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(backgroundShift.value, [0, 1], [-100, 100], Extrapolation.CLAMP),
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

  const logoRotateStyle = useAnimatedStyle(() => ({
    transform: [/* { rotate: `${logoRotate.value}deg` } */],
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

  const codeInputScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: codeInputScale.value }],
  }))

  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <StatusBar translucent />

        {/* Revolutionary Cosmic Background */}
        <Animated.View style={[StyleSheet.absoluteFillObject, backgroundAnimatedStyle]}>
          <FluidGradient
            variant="aurora"
            animated
            speed="slow"
            style={StyleSheet.absoluteFillObject}
            opacity={0.5}
          />
        </Animated.View>

        {/* Enhanced Gradient Overlay */}
        <LinearGradient
          colors={['rgba(124, 58, 237, 0.8)', 'rgba(17, 24, 39, 0.95)']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Floating Particles */}
        <Animated.View style={[styles.particle, { top: '30%' }, particleFlowStyle]}>
          <View style={[styles.particleDot, { backgroundColor: '#c084fc' }]} />
        </Animated.View>
        <Animated.View style={[styles.particle, { top: '60%' }, particleFlowStyle]}>
          <View style={[styles.particleDot, { backgroundColor: '#a78bfa' }]} />
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
              {/* Verification Header */}
              <Animated.View
                entering={SlideInRight.delay(200).springify().damping(15)}
                style={[styles.header, heroGlowStyle]}
              >
                <FloatingElement intensity={4} duration={3000}>
                  <MagneticView borderRadius={60} style={styles.verifyIconContainer}>
                    <LinearGradient
                      colors={theme.colors.gradients.primary}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <Animated.View style={logoRotateStyle}>
                      <Ionicons name="mail-open" size={56} color="#ffffff" />
                    </Animated.View>
                  </MagneticView>
                </FloatingElement>

                <GradientTitle animated style={styles.title}>
                  Verify Your Email
                </GradientTitle>

                <TypewriterText animated delay={400} style={styles.subtitle}>
                  We&apos;ve sent a verification code to {email}
                </TypewriterText>
              </Animated.View>

              {/* Enhanced Verification Form */}
              <Animated.View
                entering={ZoomIn.delay(600).springify().damping(12)}
                style={formFloatStyle}
              >
                <HolographicView
                  morphing
                  borderRadius={32}
                  style={[styles.signUpCard, isLandscape && styles.signUpCardLandscape]}
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
                    <GlowText style={styles.cardTitle}>Enter Verification Code</GlowText>

                    <TypewriterText animated delay={700} style={styles.cardSubtitle}>
                      Please enter the 6-digit code sent to your email
                    </TypewriterText>

                    <View style={styles.formContainer}>
                      {/* Code Input */}
                      <View style={styles.inputWrapper}>
                        <GlowText style={styles.inputLabel}>Verification Code</GlowText>
                        <Animated.View style={codeInputScaleStyle}>
                          <MagneticView borderRadius={16} style={styles.codeInputContainer}>
                            <BlurView
                              intensity={60}
                              tint="dark"
                              style={StyleSheet.absoluteFillObject}
                            />
                            <View style={styles.inputInner}>
                              <Ionicons name="key" size={20} color={theme.colors.primary} />
                              <TextInput
                                style={styles.codeInput}
                                placeholder="000000"
                                value={code}
                                onChangeText={(text) => {
                                  setCode(text)
                                  if (text.length === 6) {
                                    codeInputScale.value = withSequence(
                                      withSpring(1.05, MICRO_SPRING_CONFIG.instant),
                                      withSpring(1, MICRO_SPRING_CONFIG.bouncy),
                                    )
                                  }
                                }}
                                keyboardType="number-pad"
                                autoCapitalize="none"
                                autoCorrect={false}
                                placeholderTextColor={theme.colors.textMuted}
                                maxLength={6}
                              />
                            </View>
                          </MagneticView>
                        </Animated.View>
                      </View>

                      {/* Verify Button */}
                      <Animated.View style={buttonPulseStyle}>
                        <AnimatedPressable
                          onPress={() => {
                            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium)
                            handleVerification()
                          }}
                          style={styles.signUpButtonWrapper}
                        >
                          <MagneticView borderRadius={20} style={styles.signUpButton}>
                            <LinearGradient
                              colors={theme.colors.gradients.primary}
                              style={StyleSheet.absoluteFillObject}
                            />
                            <View style={styles.buttonContent}>
                              {isLoading ? (
                                <ActivityIndicator color="#ffffff" />
                              ) : (
                                <>
                                  <GlowText style={styles.buttonText}>Verify & Continue</GlowText>
                                  <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                                </>
                              )}
                            </View>
                          </MagneticView>
                        </AnimatedPressable>
                      </Animated.View>

                      {/* Back Link */}
                      <AnimatedPressable
                        onPress={() => {
                          runOnJS(Haptics.selectionAsync)()
                          setPendingVerification(false)
                        }}
                        style={styles.backLinkContainer}
                      >
                        <Ionicons name="arrow-back" size={18} color={theme.colors.primary} />
                        <GlowText style={styles.backLink}>Back to Sign Up</GlowText>
                      </AnimatedPressable>
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
        colors={['rgba(139, 92, 246, 0.8)', 'rgba(17, 24, 39, 0.95)']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating Particles - optimized for landscape */}
      <Animated.View style={[styles.particle, { top: '15%' }, particleFlowStyle]}>
        <View style={[styles.particleDot, { backgroundColor: '#e879f9' }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, { top: '45%' }, particleFlowStyle]}>
        <View style={[styles.particleDot, { backgroundColor: '#c084fc' }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, { top: '75%' }, particleFlowStyle]}>
        <View style={[styles.particleDot, { backgroundColor: '#a78bfa' }]} />
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
              entering={SlideInRight.delay(200).springify().damping(15)}
              style={[styles.header, heroGlowStyle]}
            >
              {/* Logo/Icon */}
              <FloatingElement intensity={3} duration={4000}>
                <MagneticView borderRadius={40} style={styles.logoContainer}>
                  <LinearGradient
                    colors={theme.colors.gradients.secondary}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Ionicons name="rocket" size={48} color="#ffffff" />
                </MagneticView>
              </FloatingElement>

              <GradientTitle animated style={styles.title}>
                Join EmuReady
              </GradientTitle>

              <TypewriterText animated delay={400} style={styles.subtitle}>
                Create your account and start sharing your emulation experiences
              </TypewriterText>
            </Animated.View>

            {/* Enhanced Sign Up Form - Gamepad Optimized */}
            <Animated.View
              entering={BounceIn.delay(600).springify().damping(12)}
              style={formFloatStyle}
            >
              <HolographicView
                morphing
                borderRadius={32}
                style={[styles.signUpCard, isLandscape && styles.signUpCardLandscape]}
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
                  <GlowText style={styles.cardTitle}>Create Account</GlowText>

                  <TypewriterText animated delay={700} style={styles.cardSubtitle}>
                    Fill in your details to get started
                  </TypewriterText>

                  <View style={styles.formContainer}>
                    {/* Name Fields */}
                    <View style={styles.inputRow}>
                      <View style={[styles.inputWrapper, styles.halfWidth]}>
                        <GlowText style={styles.inputLabel}>First Name *</GlowText>
                        <MagneticView borderRadius={16} style={styles.inputContainer}>
                          <BlurView
                            intensity={60}
                            tint="dark"
                            style={StyleSheet.absoluteFillObject}
                          />
                          <View style={styles.inputInner}>
                            <Ionicons name="person" size={18} color={theme.colors.primary} />
                            <TextInput
                              style={styles.input}
                              placeholder="First name"
                              value={firstName}
                              onChangeText={setFirstName}
                              autoCapitalize="words"
                              autoCorrect={false}
                              placeholderTextColor={theme.colors.textMuted}
                            />
                          </View>
                        </MagneticView>
                      </View>

                      <View style={[styles.inputWrapper, styles.halfWidth]}>
                        <GlowText style={styles.inputLabel}>Last Name</GlowText>
                        <MagneticView borderRadius={16} style={styles.inputContainer}>
                          <BlurView
                            intensity={60}
                            tint="dark"
                            style={StyleSheet.absoluteFillObject}
                          />
                          <View style={styles.inputInner}>
                            <Ionicons
                              name="person-outline"
                              size={18}
                              color={theme.colors.primary}
                            />
                            <TextInput
                              style={styles.input}
                              placeholder="Last name"
                              value={lastName}
                              onChangeText={setLastName}
                              autoCapitalize="words"
                              autoCorrect={false}
                              placeholderTextColor={theme.colors.textMuted}
                            />
                          </View>
                        </MagneticView>
                      </View>
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputWrapper}>
                      <GlowText style={styles.inputLabel}>Email *</GlowText>
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
                      <GlowText style={styles.inputLabel}>Password *</GlowText>
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

                    {/* Sign Up Button */}
                    <Animated.View style={buttonPulseStyle}>
                      <AnimatedPressable
                        onPress={() => {
                          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium)
                          handleSignUp()
                        }}
                        style={styles.signUpButtonWrapper}
                      >
                        <MagneticView borderRadius={20} style={styles.signUpButton}>
                          <LinearGradient
                            colors={theme.colors.gradients.secondary}
                            style={StyleSheet.absoluteFillObject}
                          />
                          <View style={styles.buttonContent}>
                            {isLoading ? (
                              <ActivityIndicator color="#ffffff" />
                            ) : (
                              <>
                                <GlowText style={styles.buttonText}>Create Account</GlowText>
                                <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                              </>
                            )}
                          </View>
                        </MagneticView>
                      </AnimatedPressable>
                    </Animated.View>

                    {/* Terms */}
                    <View style={styles.termsContainer}>
                      <TypewriterText animated delay={800} style={styles.termsText}>
                        By creating an account, you agree to our Terms of Service and Privacy Policy
                      </TypewriterText>
                    </View>

                    {/* Sign In Link */}
                    <View style={styles.signInContainer}>
                      <TypewriterText animated delay={900} style={styles.signInText}>
                        Already have an account?
                      </TypewriterText>
                      <AnimatedPressable
                        onPress={() => {
                          runOnJS(Haptics.selectionAsync)()
                          handleSignIn()
                        }}
                      >
                        <GlowText style={styles.signInLink}>Sign In</GlowText>
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
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  scrollContentLandscape: {
    paddingHorizontal: '10%',
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
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  verifyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#6d28d9',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
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
  signUpCard: {
    marginHorizontal: 20,
    padding: 32,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  signUpCardLandscape: {
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
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputWrapper: {
    marginBottom: 4,
  },
  halfWidth: {
    flex: 1,
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
  codeInputContainer: {
    height: 64,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  codeInput: {
    flex: 1,
    fontSize: 24,
    color: '#ffffff',
    marginLeft: 16,
    letterSpacing: 8,
    fontWeight: '600',
  },
  signUpButtonWrapper: {
    marginTop: 8,
  },
  signUpButton: {
    height: 56,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
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
  termsContainer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  termsText: {
    fontSize: 13,
    color: '#c4b5fd',
    textAlign: 'center',
    lineHeight: 20,
  },
  signInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
  },
  signInText: {
    fontSize: 15,
    color: '#e9d5ff',
  },
  signInLink: {
    fontSize: 15,
    fontWeight: '600',
    color: '#a78bfa',
  },
  backLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  backLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a78bfa',
  },
})
