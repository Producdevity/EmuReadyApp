import { Ionicons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
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
import { SafeAreaView } from 'react-native-safe-area-context'

import { GlowText, GradientTitle, TypewriterText } from '@/components/themed/ThemedText'
import { GlassView, HolographicView, MagneticView } from '@/components/themed/ThemedView'
import { Button } from '@/components/ui'
import FluidGradient from '@/components/ui/FluidGradient'
import {
  AnimatedPressable,
  FloatingElement,
  MICRO_SPRING_CONFIG,
} from '@/components/ui/MicroInteractions'
import { useTheme } from '@/contexts/ThemeContext'
import { getBaseDelay } from '@/lib/animation/config'
import { EmulatorService } from '@/lib/services/emulator'
import { getErrorMessage } from '@/lib/utils'

interface ConfigFile {
  name: string
  content: string
  titleId: string
}

export default function ConfigScreen() {
  const { theme } = useTheme()
  const { width, height } = useWindowDimensions()
  const isLandscape = width > height
  const [configFile, setConfigFile] = useState<ConfigFile | null>(null)
  const [customTitleId, setCustomTitleId] = useState('')
  const [packageName, setPackageName] = useState('dev.eden.eden_emulator')
  const [isLoading, setIsLoading] = useState(false)
  const [showContent, setShowContent] = useState(false)

  // Animation values
  const heroGlow = useSharedValue(0)
  const uploadPulse = useSharedValue(1)
  const configFloat = useSharedValue(0)
  const backgroundShift = useSharedValue(0)
  const particleFlow = useSharedValue(0)

  useEffect(() => {
    // Initialize aurora background animation
    backgroundShift.value = withRepeat(
      withSequence(withTiming(1, { duration: 8000 }), withTiming(0, { duration: 8000 })),
      -1,
      true,
    )

    // Hero glow animation
    heroGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 3000 }), withTiming(0.3, { duration: 3000 })),
      -1,
      true,
    )

    // Floating animation for config elements
    configFloat.value = withRepeat(
      withSequence(withTiming(5, { duration: 4000 }), withTiming(-5, { duration: 4000 })),
      -1,
      true,
    )

    // Particle flow animation
    particleFlow.value = withRepeat(withTiming(1, { duration: 6000 }), -1, false)

    // Upload pulse animation
    uploadPulse.value = withRepeat(
      withSequence(
        withSpring(1.05, MICRO_SPRING_CONFIG.bouncy),
        withSpring(1, MICRO_SPRING_CONFIG.smooth),
      ),
      -1,
      true,
    )
  }, [])

  const extractTitleIdFromFilename = (filename: string): string => {
    // Remove file extension and check if it's a valid title ID
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
    if (EmulatorService.validateTitleId(nameWithoutExt)) {
      return nameWithoutExt
    }
    return ''
  }

  const handleFilePick = async () => {
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'application/octet-stream', '*/*'],
        copyToCacheDirectory: true,
      })

      if (result.canceled) {
        return
      }

      const file = result.assets[0]

      // Read file content
      const content = await FileSystem.readAsStringAsync(file.uri)

      // Extract title ID from filename
      const titleId = extractTitleIdFromFilename(file.name)

      setConfigFile({
        name: file.name,
        content: content,
        titleId: titleId,
      })

      if (titleId) {
        setCustomTitleId(titleId)
      }

      // Success haptic feedback
      runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success)

      Alert.alert(
        'File Loaded',
        `Successfully loaded ${file.name}${titleId ? `\n\nDetected Title ID: ${titleId}` : '\n\nPlease enter the Title ID manually.'}`,
      )
    } catch (error) {
      console.error('Error picking file:', error)
      runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Error)
      Alert.alert(
        'Error',
        `Failed to load configuration file. Please try again. 
        ${getErrorMessage(error)}`,
      )
    }
  }

  const handleTestWithConfig = async () => {
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium)

    if (Platform.OS !== 'android') {
      runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Warning)
      Alert.alert('Platform Error', 'Eden emulator testing is only available on Android devices.')
      return
    }

    if (!configFile) {
      runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Warning)
      Alert.alert('No Configuration', 'Please select a configuration file first.')
      return
    }

    const titleId = customTitleId || configFile.titleId

    if (!titleId.trim()) {
      runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Warning)
      Alert.alert('Missing Title ID', 'Please enter a Title ID.')
      return
    }

    if (!EmulatorService.validateTitleId(titleId)) {
      runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Error)
      Alert.alert(
        'Invalid Title ID',
        'Title ID must be a 16-digit hexadecimal string (e.g., 0100000000010000).',
      )
      return
    }

    setIsLoading(true)

    try {
      await EmulatorService.launchGameWithCustomSettings({
        titleId: titleId.trim(),
        customSettings: configFile.content,
        packageName: packageName.trim(),
      })

      runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success)
      Alert.alert(
        'Launch Successful',
        `Emulator launch command sent successfully to ${packageName}!`,
      )
    } catch (error) {
      console.error('Error testing emulator:', error)
      runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Error)
      Alert.alert(
        'Launch Error',
        `An unexpected error occurred while testing the emulator. ${getErrorMessage(error)}`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearConfig = () => {
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)

    Alert.alert(
      'Clear Configuration',
      'Are you sure you want to clear the current configuration?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium)
            setConfigFile(null)
            setCustomTitleId('')
            setShowContent(false)
          },
        },
      ],
    )
  }

  // Animated styles
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(backgroundShift.value, [0, 1], [-50, 50], Extrapolation.CLAMP),
      },
    ],
  }))

  const heroGlowStyle = useAnimatedStyle(() => ({
    opacity: heroGlow.value,
  }))

  const uploadPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: uploadPulse.value }],
  }))

  const configFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: configFloat.value }],
  }))

  const particleFlowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(particleFlow.value, [0, 1], [-100, 400], Extrapolation.CLAMP),
      },
    ],
    opacity: interpolate(particleFlow.value, [0, 0.3, 0.7, 1], [0, 1, 1, 0], Extrapolation.CLAMP),
  }))

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Aurora Background */}
      <Animated.View style={[StyleSheet.absoluteFillObject, backgroundAnimatedStyle]}>
        <FluidGradient
          variant="aurora"
          animated
          speed="slow"
          style={StyleSheet.absoluteFillObject}
          opacity={0.15}
        />
      </Animated.View>

      {/* Floating Particles */}
      <Animated.View style={[styles.particle, { top: '20%' }, particleFlowStyle]}>
        <View style={[styles.particleDot, { backgroundColor: `${theme.colors.primary}40` }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, { top: '40%' }, particleFlowStyle]}>
        <View style={[styles.particleDot, { backgroundColor: `${theme.colors.secondary}40` }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, { top: '60%' }, particleFlowStyle]}>
        <View style={[styles.particleDot, { backgroundColor: `${theme.colors.accent}40` }]} />
      </Animated.View>

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              padding: isLandscape ? theme.spacing.md : theme.spacing.lg,
              paddingHorizontal: isLandscape ? theme.spacing.xl : theme.spacing.lg,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Enhanced Hero Header */}
            <Animated.View
              entering={SlideInLeft.delay(getBaseDelay('instant')).springify().damping(15)}
            >
              <FloatingElement intensity={3} duration={4000}>
                <View style={styles.heroContainer}>
                  {/* Hero glow effect */}
                  <Animated.View style={[styles.heroGlow, heroGlowStyle]}>
                    <LinearGradient
                      colors={['transparent', `${theme.colors.primary}30`, 'transparent']}
                      style={StyleSheet.absoluteFillObject}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </Animated.View>

                  <MagneticView borderRadius={32} style={styles.heroIcon}>
                    <LinearGradient
                      colors={theme.colors.gradients.primary}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <FloatingElement intensity={2} duration={2000}>
                      <Ionicons name="document-text" size={28} color="#ffffff" />
                    </FloatingElement>
                  </MagneticView>

                  <View style={styles.heroContent}>
                    <GradientTitle animated style={styles.heroTitle}>
                      Config File Tester
                    </GradientTitle>

                    <TypewriterText animated delay={300} style={styles.heroSubtitle}>
                      Upload and test INI configurations with next-gen precision
                    </TypewriterText>
                  </View>
                </View>
              </FloatingElement>
            </Animated.View>

            {/* Enhanced Information Card */}
            <Animated.View entering={BounceIn.delay(getBaseDelay('fast')).springify().damping(12)}>
              <FloatingElement intensity={2} duration={5000}>
                <GlassView borderRadius={24} blurIntensity={25} style={styles.infoCard}>
                  <FluidGradient
                    variant="cosmic"
                    borderRadius={24}
                    animated
                    speed="normal"
                    style={StyleSheet.absoluteFillObject}
                    opacity={0.08}
                  />

                  <View style={styles.infoContent}>
                    <View style={styles.infoHeader}>
                      <HolographicView morphing borderRadius={16} style={styles.infoIconContainer}>
                        <FloatingElement intensity={1} duration={3000}>
                          <Ionicons
                            name="information-circle"
                            size={24}
                            color={theme.colors.primary}
                          />
                        </FloatingElement>
                      </HolographicView>

                      <GlowText style={styles.infoTitle}>How to Use</GlowText>
                    </View>

                    <TypewriterText animated delay={500} style={styles.infoDescription}>
                      Upload an INI configuration file (e.g., 0100000000010000.ini) to test custom
                      game settings. The app will try to detect the Title ID from the filename with
                      AI-powered precision.
                    </TypewriterText>
                  </View>
                </GlassView>
              </FloatingElement>
            </Animated.View>

            {/* Revolutionary File Upload Section */}
            <Animated.View
              entering={SlideInLeft.delay(getBaseDelay('normal')).springify().damping(15)}
              style={configFloatStyle}
            >
              <FloatingElement intensity={3} duration={6000}>
                <HolographicView morphing borderRadius={28} style={styles.uploadCard}>
                  <FluidGradient
                    variant="gaming"
                    borderRadius={28}
                    animated
                    speed="fast"
                    style={StyleSheet.absoluteFillObject}
                    opacity={0.12}
                  />

                  <View style={styles.uploadContent}>
                    <GradientTitle animated style={styles.uploadTitle}>
                      Configuration File
                    </GradientTitle>

                    {/* Revolutionary File Picker */}
                    <Animated.View style={uploadPulseStyle}>
                      <AnimatedPressable onPress={handleFilePick}>
                        <MagneticView
                          borderRadius={20}
                          animated
                          hoverable
                          style={[styles.filePicker, configFile && styles.filePickerActive]}
                        >
                          <FluidGradient
                            variant={configFile ? 'gaming' : 'cosmic'}
                            borderRadius={20}
                            animated
                            speed="normal"
                            style={StyleSheet.absoluteFillObject}
                            opacity={0.15}
                          />

                          <FloatingElement intensity={4} duration={3000}>
                            <View style={styles.filePickerIconContainer}>
                              <LinearGradient
                                colors={
                                  configFile
                                    ? [theme.colors.success, `${theme.colors.success}80`]
                                    : theme.colors.gradients.primary
                                }
                                style={styles.filePickerIconGradient}
                              >
                                <Ionicons
                                  name={configFile ? 'document-text' : 'cloud-upload'}
                                  size={32}
                                  color="#ffffff"
                                />
                              </LinearGradient>
                            </View>
                          </FloatingElement>

                          <GlowText
                            style={[
                              styles.filePickerTitle,
                              configFile && styles.filePickerTitleActive,
                            ]}
                          >
                            {configFile ? configFile.name : 'Select INI File'}
                          </GlowText>

                          <TypewriterText animated delay={200} style={styles.filePickerSubtitle}>
                            {configFile
                              ? 'Tap to change file'
                              : 'Tap to browse for configuration files'}
                          </TypewriterText>
                        </MagneticView>
                      </AnimatedPressable>
                    </Animated.View>

                    {configFile && (
                      <Animated.View entering={SlideInLeft.delay(400).springify().damping(15)}>
                        {/* Enhanced Title ID Field */}
                        <FloatingElement intensity={2} duration={4000}>
                          <View style={styles.formSection}>
                            <GlowText style={styles.fieldLabel}>Title ID</GlowText>

                            <TypewriterText animated delay={100} style={styles.fieldHint}>
                              {configFile.titleId
                                ? 'Auto-detected from filename'
                                : 'Enter the game Title ID'}
                            </TypewriterText>

                            <MagneticView borderRadius={16} style={styles.inputContainer}>
                              <FluidGradient
                                variant="cosmic"
                                borderRadius={16}
                                animated
                                speed="slow"
                                style={StyleSheet.absoluteFillObject}
                                opacity={0.1}
                              />
                              <TextInput
                                style={styles.textInput}
                                value={customTitleId}
                                onChangeText={setCustomTitleId}
                                placeholder={configFile.titleId || '0100000000010000'}
                                placeholderTextColor={theme.colors.textMuted}
                                maxLength={16}
                                autoCapitalize="characters"
                                autoCorrect={false}
                              />
                            </MagneticView>
                          </View>
                        </FloatingElement>

                        {/* Enhanced Package Name Field */}
                        <FloatingElement intensity={2} duration={5000}>
                          <View style={styles.formSection}>
                            <GlowText style={styles.fieldLabel}>Emulator Package Name</GlowText>

                            <MagneticView borderRadius={16} style={styles.inputContainer}>
                              <FluidGradient
                                variant="gaming"
                                borderRadius={16}
                                animated
                                speed="slow"
                                style={StyleSheet.absoluteFillObject}
                                opacity={0.1}
                              />
                              <TextInput
                                style={styles.textInput}
                                value={packageName}
                                onChangeText={setPackageName}
                                placeholder="dev.eden.eden_emulator"
                                placeholderTextColor={theme.colors.textMuted}
                                autoCapitalize="none"
                                autoCorrect={false}
                              />
                            </MagneticView>
                          </View>
                        </FloatingElement>

                        {/* Revolutionary Action Buttons */}
                        <FloatingElement intensity={3} duration={6000}>
                          <View
                            style={[styles.actionButtons, isLandscape && styles.actionButtonsRow]}
                          >
                            <MagneticView
                              borderRadius={16}
                              style={[styles.actionButton, isLandscape && styles.actionButtonFlex]}
                            >
                              <Button
                                title={showContent ? 'Hide Content' : 'Show Content'}
                                onPress={() => setShowContent(!showContent)}
                                variant="outline"
                                size="lg"
                                style={styles.button}
                                leftIcon={
                                  <Ionicons
                                    name={showContent ? 'eye-off' : 'eye'}
                                    size={20}
                                    color={theme.colors.primary}
                                  />
                                }
                              />
                            </MagneticView>

                            <MagneticView
                              borderRadius={16}
                              style={[styles.actionButton, isLandscape && styles.actionButtonFlex]}
                            >
                              <Button
                                title="Clear Config"
                                onPress={handleClearConfig}
                                variant="secondary"
                                size="lg"
                                style={styles.button}
                                leftIcon={
                                  <Ionicons name="trash" size={20} color={theme.colors.text} />
                                }
                              />
                            </MagneticView>

                            <MagneticView
                              borderRadius={16}
                              style={[styles.actionButton, isLandscape && styles.actionButtonFlex]}
                            >
                              <LinearGradient
                                colors={theme.colors.gradients.primary}
                                style={StyleSheet.absoluteFillObject}
                              />
                              <Button
                                title="Test Config"
                                onPress={handleTestWithConfig}
                                loading={isLoading}
                                disabled={isLoading || Platform.OS !== 'android'}
                                variant="primary"
                                size="lg"
                                style={styles.button}
                                leftIcon={
                                  <Ionicons
                                    name="play"
                                    size={20}
                                    color={theme.colors.textInverse}
                                  />
                                }
                              />
                            </MagneticView>
                          </View>
                        </FloatingElement>
                      </Animated.View>
                    )}

                    {Platform.OS !== 'android' && (
                      <FloatingElement intensity={1} duration={3000}>
                        <TypewriterText animated delay={800} style={styles.platformWarning}>
                          Eden emulator testing is only available on Android
                        </TypewriterText>
                      </FloatingElement>
                    )}
                  </View>
                </HolographicView>
              </FloatingElement>
            </Animated.View>

            {/* Revolutionary Config Content Preview */}
            {configFile && showContent && (
              <Animated.View
                entering={BounceIn.delay(getBaseDelay('fast')).springify().damping(12)}
              >
                <FloatingElement intensity={2} duration={7000}>
                  <HolographicView morphing borderRadius={24} style={styles.previewCard}>
                    <FluidGradient
                      variant="aurora"
                      borderRadius={24}
                      animated
                      speed="slow"
                      style={StyleSheet.absoluteFillObject}
                      opacity={0.1}
                    />

                    <View style={styles.previewContent}>
                      <View style={styles.previewHeader}>
                        <View style={styles.previewHeaderLeft}>
                          <MagneticView borderRadius={12} style={styles.previewIconContainer}>
                            <FloatingElement intensity={1} duration={2000}>
                              <Ionicons name="code" size={20} color={theme.colors.primary} />
                            </FloatingElement>
                          </MagneticView>

                          <GlowText style={styles.previewTitle}>Configuration Content</GlowText>
                        </View>

                        <TypewriterText animated delay={200} style={styles.previewStats}>
                          {configFile.content.length} chars
                        </TypewriterText>
                      </View>

                      <GlassView borderRadius={16} blurIntensity={20} style={styles.codeContainer}>
                        <ScrollView
                          style={styles.codeScrollView}
                          showsVerticalScrollIndicator={true}
                        >
                          <Text style={styles.codeText}>{configFile.content}</Text>
                        </ScrollView>
                      </GlassView>
                    </View>
                  </HolographicView>
                </FloatingElement>
              </Animated.View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    left: -20,
  },
  particleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  heroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  heroGlow: {
    position: 'absolute',
    top: -16,
    left: -16,
    right: -16,
    bottom: -16,
    borderRadius: 32,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    position: 'relative',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  heroSubtitle: {
    fontSize: 16,
    marginTop: 4,
    lineHeight: 24,
  },
  infoCard: {
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  infoContent: {
    padding: 24,
    position: 'relative',
    zIndex: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  infoDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  uploadCard: {
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  uploadContent: {
    padding: 24,
    position: 'relative',
    zIndex: 1,
  },
  uploadTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
  },
  filePicker: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(124, 58, 237, 0.3)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  filePickerActive: {
    borderColor: 'rgba(34, 197, 94, 0.5)',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  filePickerIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    marginBottom: 16,
  },
  filePickerIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  filePickerTitleActive: {
    color: '#22c55e',
  },
  filePickerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  fieldHint: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  inputContainer: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'monospace',
    position: 'relative',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  actionButtons: {
    gap: 16,
    marginTop: 8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
  },
  actionButton: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
  },
  actionButtonFlex: {
    flex: 1,
  },
  button: {
    width: '100%',
    borderRadius: 16,
  },
  platformWarning: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  previewCard: {
    position: 'relative',
    overflow: 'hidden',
  },
  previewContent: {
    padding: 24,
    position: 'relative',
    zIndex: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  previewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  previewStats: {
    fontSize: 12,
  },
  codeContainer: {
    maxHeight: 400,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  codeScrollView: {
    padding: 16,
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
})
