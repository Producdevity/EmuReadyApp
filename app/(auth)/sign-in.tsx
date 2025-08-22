import { GlowText, GradientTitle, TypewriterText } from '@/components/themed/ThemedText'
import { GlassView } from '@/components/themed/ThemedView'
import { Button } from '@/components/ui'
import { AnimatedPressable } from '@/components/ui/MicroInteractions'
import { useTheme } from '@/contexts/ThemeContext'
import { useSignIn } from '@clerk/clerk-expo'
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

export default function SignInScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const { signIn, setActive, isLoaded } = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Simple animation values
  const logoScale = useSharedValue(0.8)

  useEffect(() => {
    // Simple logo entrance animation
    logoScale.value = withSpring(1, { damping: 15, stiffness: 300 })
  }, [logoScale])

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
  const logoScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }))

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
                  <Ionicons name="game-controller" size={48} color={theme.colors.background} />
                </View>
              </Animated.View>

              <GradientTitle animated style={[styles.title, { color: theme.colors.textInverse }]}>
                Welcome Back
              </GradientTitle>

              <TypewriterText animated delay={400} style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Sign in to continue your gaming journey
              </TypewriterText>
            </Animated.View>

            {/* Sign In Form */}
            <Animated.View
              entering={BounceIn.delay(600).springify().damping(12)}
            >
              <GlassView 
                borderRadius={24} 
                blurIntensity={20} 
                style={[styles.signInCard, isLandscape && styles.signInCardLandscape]}
              >
                <View style={styles.cardContent}>
                  <GlowText style={[styles.cardTitle, { color: theme.colors.text }]}>
                    Sign In
                  </GlowText>

                  <TypewriterText animated delay={700} style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
                    Enter your credentials to access your EmuReady profile
                  </TypewriterText>

                  <View style={styles.formContainer}>
                    {/* Email Input */}
                    <View style={styles.inputWrapper}>
                      <GlowText style={[styles.inputLabel, { color: theme.colors.text }]}>Email</GlowText>
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
                      <GlowText style={[styles.inputLabel, { color: theme.colors.text }]}>Password</GlowText>
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

                    {/* Sign In Button */}
                    <View style={styles.signInButtonWrapper}>
                      <Button
                        title={isLoading ? "Signing In..." : "Sign In"}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                          handleSignIn()
                        }}
                        loading={isLoading}
                        disabled={isLoading}
                        variant="primary"
                        size="lg"
                        style={styles.signInButton}
                        leftIcon={!isLoading ? <Ionicons name="arrow-forward" size={20} color={theme.colors.textInverse} /> : undefined}
                      />
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.signUpContainer}>
                      <TypewriterText animated delay={800} style={[styles.signUpText, { color: theme.colors.textSecondary }]}>
                        New player?
                      </TypewriterText>
                      <AnimatedPressable
                        onPress={() => {
                          Haptics.selectionAsync()
                          handleSignUp()
                        }}
                      >
                        <GlowText style={[styles.signUpLink, { color: theme.colors.primary }]}>Create Account</GlowText>
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
  signInCard: {
    marginHorizontal: 20,
    padding: 32,
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
  inputWrapper: {
    marginBottom: 4,
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
  signInButtonWrapper: {
    marginTop: 8,
  },
  signInButton: {
    borderRadius: 16,
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
  },
  signUpLink: {
    fontSize: 15,
    fontWeight: '600',
  },
})
