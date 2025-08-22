import { GlowText, GradientTitle, TypewriterText } from '@/components/themed/ThemedText'
import { GlassView } from '@/components/themed/ThemedView'
import { Button } from '@/components/ui'
import { AnimatedPressable } from '@/components/ui/MicroInteractions'
import { useTheme } from '@/contexts/ThemeContext'
import { useSignUp } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
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
  SlideInLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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

  // Simple animation values
  const logoScale = useSharedValue(0.8)
  const codeInputScale = useSharedValue(1)

  useEffect(() => {
    // Simple logo entrance animation
    logoScale.value = withSpring(1, { damping: 15, stiffness: 300 })
  }, [logoScale])

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
  const logoScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }))

  const codeInputScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: codeInputScale.value }],
  }))

  if (pendingVerification) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} translucent />

        {/* Clean gradient background */}
        <LinearGradient
          colors={theme.colors.gradients.primary}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

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
                entering={SlideInLeft.delay(200).springify().damping(15)}
                style={styles.header}
              >
                {/* Logo/Icon */}
                <Animated.View style={[logoScaleStyle, styles.logoContainer]}>
                  <View style={[styles.logoInner, { backgroundColor: theme.colors.primary }]}>
                    <Ionicons name="mail-open" size={48} color={theme.colors.background} />
                  </View>
                </Animated.View>

                <GradientTitle animated style={[styles.title, { color: theme.colors.textInverse }]}>
                  Verify Your Email
                </GradientTitle>

                <TypewriterText animated delay={400} style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  We&apos;ve sent a verification code to {email}
                </TypewriterText>
              </Animated.View>

              {/* Verification Form */}
              <Animated.View
                entering={BounceIn.delay(600).springify().damping(12)}
              >
                <GlassView 
                  borderRadius={24} 
                  blurIntensity={20} 
                  style={[styles.signUpCard, isLandscape && styles.signUpCardLandscape]}
                >
                  <View style={styles.cardContent}>
                    <GlowText style={[styles.cardTitle, { color: theme.colors.text }]}>
                      Enter Verification Code
                    </GlowText>

                    <TypewriterText animated delay={700} style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
                      Please enter the 6-digit code sent to your email
                    </TypewriterText>

                    <View style={styles.formContainer}>
                      {/* Code Input */}
                      <View style={styles.inputWrapper}>
                        <GlowText style={[styles.inputLabel, { color: theme.colors.text }]}>Verification Code</GlowText>
                        <Animated.View style={codeInputScaleStyle}>
                          <View style={[styles.codeInputContainer, { 
                            backgroundColor: theme.colors.surface, 
                            borderColor: theme.colors.border 
                          }]}>
                            <View style={styles.inputInner}>
                              <Ionicons name="key" size={20} color={theme.colors.primary} />
                              <TextInput
                                style={[styles.codeInput, { color: theme.colors.text }]}
                                placeholder="000000"
                                value={code}
                                onChangeText={(text) => {
                                  setCode(text)
                                  if (text.length === 6) {
                                    codeInputScale.value = withSpring(1.05, { damping: 15, stiffness: 300 })
                                    setTimeout(() => {
                                      codeInputScale.value = withSpring(1, { damping: 15, stiffness: 300 })
                                    }, 100)
                                  }
                                }}
                                keyboardType="number-pad"
                                autoCapitalize="none"
                                autoCorrect={false}
                                placeholderTextColor={theme.colors.textMuted}
                                maxLength={6}
                              />
                            </View>
                          </View>
                        </Animated.View>
                      </View>

                      {/* Verify Button */}
                      <View style={styles.verifyButtonWrapper}>
                        <Button
                          title={isLoading ? "Verifying..." : "Verify & Continue"}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                            handleVerification()
                          }}
                          loading={isLoading}
                          disabled={isLoading}
                          variant="primary"
                          size="lg"
                          style={styles.verifyButton}
                          leftIcon={!isLoading ? <Ionicons name="checkmark-circle" size={20} color={theme.colors.textInverse} /> : undefined}
                        />
                      </View>

                      {/* Back Link */}
                      <View style={styles.backContainer}>
                        <AnimatedPressable
                          onPress={() => {
                            Haptics.selectionAsync()
                            setPendingVerification(false)
                          }}
                          style={styles.backLinkContainer}
                        >
                          <Ionicons name="arrow-back" size={18} color={theme.colors.primary} />
                          <GlowText style={[styles.backLink, { color: theme.colors.primary }]}>Back to Sign Up</GlowText>
                        </AnimatedPressable>
                      </View>
                    </View>
                  </View>
                </GlassView>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} translucent />

      {/* Clean gradient background */}
      <LinearGradient
        colors={theme.colors.gradients.primary}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

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
              style={styles.header}
            >
              {/* Logo/Icon */}
              <Animated.View style={[logoScaleStyle, styles.logoContainer]}>
                <View style={[styles.logoInner, { backgroundColor: theme.colors.primary }]}>
                  <Ionicons name="rocket" size={48} color={theme.colors.background} />
                </View>
              </Animated.View>

              <GradientTitle animated style={[styles.title, { color: theme.colors.textInverse }]}>
                Join EmuReady
              </GradientTitle>

              <TypewriterText animated delay={400} style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Create your account and start sharing your emulation experiences
              </TypewriterText>
            </Animated.View>

            {/* Sign Up Form */}
            <Animated.View
              entering={BounceIn.delay(600).springify().damping(12)}
            >
              <GlassView 
                borderRadius={24} 
                blurIntensity={20} 
                style={[styles.signUpCard, isLandscape && styles.signUpCardLandscape]}
              >
                <View style={styles.cardContent}>
                  <GlowText style={[styles.cardTitle, { color: theme.colors.text }]}>
                    Create Account
                  </GlowText>

                  <TypewriterText animated delay={700} style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
                    Fill in your details to get started
                  </TypewriterText>

                  <View style={styles.formContainer}>
                    {/* Name Fields */}
                    <View style={styles.inputRow}>
                      <View style={[styles.inputWrapper, styles.halfWidth]}>
                        <GlowText style={[styles.inputLabel, { color: theme.colors.text }]}>First Name *</GlowText>
                        <View style={[styles.inputContainer, { 
                          backgroundColor: theme.colors.surface, 
                          borderColor: theme.colors.border 
                        }]}>
                          <View style={styles.inputInner}>
                            <Ionicons name="person" size={18} color={theme.colors.primary} />
                            <TextInput
                              style={[styles.input, { color: theme.colors.text }]}
                              placeholder="First name"
                              value={firstName}
                              onChangeText={setFirstName}
                              autoCapitalize="words"
                              autoCorrect={false}
                              placeholderTextColor={theme.colors.textMuted}
                            />
                          </View>
                        </View>
                      </View>

                      <View style={[styles.inputWrapper, styles.halfWidth]}>
                        <GlowText style={[styles.inputLabel, { color: theme.colors.text }]}>Last Name</GlowText>
                        <View style={[styles.inputContainer, { 
                          backgroundColor: theme.colors.surface, 
                          borderColor: theme.colors.border 
                        }]}>
                          <View style={styles.inputInner}>
                            <Ionicons name="person-outline" size={18} color={theme.colors.primary} />
                            <TextInput
                              style={[styles.input, { color: theme.colors.text }]}
                              placeholder="Last name"
                              value={lastName}
                              onChangeText={setLastName}
                              autoCapitalize="words"
                              autoCorrect={false}
                              placeholderTextColor={theme.colors.textMuted}
                            />
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputWrapper}>
                      <GlowText style={[styles.inputLabel, { color: theme.colors.text }]}>Email *</GlowText>
                      <View style={[styles.inputContainer, { 
                        backgroundColor: theme.colors.surface, 
                        borderColor: theme.colors.border 
                      }]}>
                        <View style={styles.inputInner}>
                          <Ionicons name="mail" size={20} color={theme.colors.primary} />
                          <TextInput
                            style={[styles.input, { color: theme.colors.text }]}
                            placeholder="player@emuready.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            placeholderTextColor={theme.colors.textMuted}
                          />
                        </View>
                      </View>
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputWrapper}>
                      <GlowText style={[styles.inputLabel, { color: theme.colors.text }]}>Password *</GlowText>
                      <View style={[styles.inputContainer, { 
                        backgroundColor: theme.colors.surface, 
                        borderColor: theme.colors.border 
                      }]}>
                        <View style={styles.inputInner}>
                          <Ionicons name="lock-closed" size={20} color={theme.colors.primary} />
                          <TextInput
                            style={[styles.input, { color: theme.colors.text }]}
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                            placeholderTextColor={theme.colors.textMuted}
                          />
                        </View>
                      </View>
                    </View>

                    {/* Sign Up Button */}
                    <View style={styles.signUpButtonWrapper}>
                      <Button
                        title={isLoading ? "Creating Account..." : "Create Account"}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                          handleSignUp()
                        }}
                        loading={isLoading}
                        disabled={isLoading}
                        variant="primary"
                        size="lg"
                        style={styles.signUpButton}
                        leftIcon={!isLoading ? <Ionicons name="arrow-forward" size={20} color={theme.colors.textInverse} /> : undefined}
                      />
                    </View>

                    {/* Terms */}
                    <View style={[styles.termsContainer, { borderTopColor: theme.colors.border }]}>
                      <TypewriterText animated delay={800} style={[styles.termsText, { color: theme.colors.textSecondary }]}>
                        By creating an account, you agree to our Terms of Service and Privacy Policy
                      </TypewriterText>
                    </View>

                    {/* Sign In Link */}
                    <View style={styles.signInContainer}>
                      <TypewriterText animated delay={900} style={[styles.signInText, { color: theme.colors.textSecondary }]}>
                        Already have an account?
                      </TypewriterText>
                      <AnimatedPressable
                        onPress={() => {
                          Haptics.selectionAsync()
                          handleSignIn()
                        }}
                      >
                        <GlowText style={[styles.signInLink, { color: theme.colors.primary }]}>Sign In</GlowText>
                      </AnimatedPressable>
                    </View>
                  </View>
                </View>
              </GlassView>
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
    marginBottom: 24,
  },
  logoInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 16,
  },
  signUpCard: {
    marginHorizontal: 20,
    padding: 32,
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
    textAlign: 'center',
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 16,
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
    marginBottom: 10,
    marginLeft: 4,
  },
  inputContainer: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
  },
  codeInputContainer: {
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
  },
  inputInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  codeInput: {
    flex: 1,
    fontSize: 24,
    marginLeft: 16,
    letterSpacing: 8,
    fontWeight: '600',
  },
  signUpButtonWrapper: {
    marginTop: 8,
  },
  signUpButton: {
    borderRadius: 16,
  },
  verifyButtonWrapper: {
    marginTop: 8,
  },
  verifyButton: {
    borderRadius: 16,
  },
  termsContainer: {
    paddingTop: 20,
    borderTopWidth: 1,
  },
  termsText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  signInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 6,
  },
  signInText: {
    fontSize: 15,
  },
  signInLink: {
    fontSize: 15,
    fontWeight: '600',
  },
  backContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  backLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backLink: {
    fontSize: 16,
    fontWeight: '600',
  },
})
