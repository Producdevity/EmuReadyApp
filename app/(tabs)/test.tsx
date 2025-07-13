import { getErrorMessage } from '@/lib/utils'
import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/contexts/ThemeContext'
import { Button, Card } from '@/components/ui'
import { EmulatorService } from '@/lib/services/emulator'
import { EmulatorAltService } from '@/lib/services/emulator-alt'
import { getBaseDelay, ANIMATION_CONFIG } from '@/lib/animation/config'

export default function TestScreen() {
  const { theme } = useTheme()
  const { width, height } = useWindowDimensions()
  const isLandscape = width > height
  const [titleId, setTitleId] = useState('0100000000010000')
  const [driverPath, setDriverPath] = useState('custom.adpkg.zip')
  const [packageName, setPackageName] = useState('dev.eden.eden_emulator')
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showDebugOptions, setShowDebugOptions] = useState(false)
  const [debugMessages, _setDebugMessages] = useState<string[]>([])

  const getFullDriverPath = (filename: string, targetPackage: string = packageName) => {
    // Use the actual package name in the path
    const basePath = `/storage/emulated/0/Android/data/${targetPackage}/files/gpu_drivers/`
    return basePath + filename
  }

  const generateCustomSettings = (driverFilename: string) => {
    const fullPath = getFullDriverPath(driverFilename, packageName)
    return `[Controls]
vibration_enabled\\\\\\\\use_global=true
enable_accurate_vibrations\\\\\\\\use_global=true
motion_enabled\\\\\\\\use_global=true

[Core]
use_multi_core\\\\\\\\use_global=true
memory_layout_mode\\\\\\\\use_global=true
use_speed_limit\\\\\\\\use_global=true

[Renderer]
backend\\\\\\\\use_global=true
shader_backend\\\\\\\\use_global=true
use_vsync\\\\\\\\use_global=false
use_vsync\\\\\\\\default=false
use_vsync=0
use_asynchronous_shaders\\\\\\\\use_global=false
use_asynchronous_shaders\\\\\\\\default=false
use_asynchronous_shaders=true

[Audio]
output_engine\\\\\\\\use_global=true
volume\\\\\\\\use_global=true

[System]
use_docked_mode\\\\\\\\use_global=true
language_index\\\\\\\\use_global=true

[GpuDriver]
driver_path\\\\\\\\use_global=false
driver_path\\\\\\\\default=false
driver_path=${fullPath}`
  }

  const handleTestEden = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Platform Error', 'Eden emulator testing is only available on Android devices.')
      return
    }

    if (!titleId.trim()) {
      Alert.alert('Validation Error', 'Please enter a Title ID.')
      return
    }

    if (!driverPath.trim()) {
      Alert.alert('Validation Error', 'Please enter a Driver Path.')
      return
    }

    if (!packageName.trim()) {
      Alert.alert('Validation Error', 'Please enter a Package Name.')
      return
    }

    if (!EmulatorService.validateTitleId(titleId)) {
      Alert.alert(
        'Validation Error',
        'Title ID must be a 16-digit hexadecimal string (e.g., 0100000000010000).',
      )
      return
    }

    setIsLoading(true)

    try {
      console.log('=== Starting Eden Emulator Test ===')
      console.log('Title ID:', titleId.trim())
      console.log('Driver Path:', driverPath)
      console.log('Package Name:', packageName.trim())

      // Use the "Known Working Config" preset with Linking approach
      console.log('Using "Known Working Config" preset with Linking approach')
      await EmulatorService.launchGameWithPreset(
        titleId.trim(),
        'Known Working Config',
        packageName.trim(),
      )

      console.log('EmulatorService call completed successfully')
      Alert.alert(
        'Launch Successful',
        `Emulator launch command sent successfully to ${packageName}!`,
      )
    } catch (error) {
      console.error('=== Error testing emulator ===')
      console.error('Error object:', error)
      console.error('Error message:', (error as any)?.message)
      console.error('Error name:', (error as any)?.name)
      console.error('Error stack:', (error as any)?.stack)

      const errorMessage = getErrorMessage(error)
      console.error('Formatted error message:', errorMessage)

      Alert.alert(
        'Launch Error',
        `Failed to launch Eden emulator.\n\nError: ${errorMessage}\n\nCheck console logs for detailed information.`,
      )
    } finally {
      console.log('=== Eden Emulator Test Completed ===')
      setIsLoading(false)
    }
  }

  const handleDebugMethods = () => {
    EmulatorAltService.logAvailableMethods()
    Alert.alert('Debug Info', 'Check console logs for available methods')
  }

  const handleCheckInstallation = async () => {
    try {
      const isInstalled = await EmulatorAltService.checkIfInstalled(packageName)
      console.log(`Package ${packageName} is ${isInstalled ? 'installed' : 'NOT installed'}`)
      Alert.alert(
        'Installation Check',
        `Package ${packageName} is ${isInstalled ? 'installed' : 'NOT installed'}`,
      )
    } catch (error) {
      console.error('Installation check failed:', error)
      Alert.alert('Installation Check', 'Could not verify installation status')
    }
  }

  const handleTestAlternative = async (method: string) => {
    if (Platform.OS !== 'android') {
      Alert.alert('Platform Error', 'Only available on Android')
      return
    }

    if (!titleId.trim() || !EmulatorService.validateTitleId(titleId)) {
      Alert.alert('Invalid Title ID', 'Please enter a valid 16-digit hex Title ID')
      return
    }

    setIsLoading(true)
    const customSettings = generateCustomSettings(driverPath)

    try {
      switch (method) {
        case 'openApp':
          await EmulatorAltService.launchWithDirectIntent(
            titleId.trim(),
            customSettings,
            packageName.trim(),
          )
          break
        case 'linking':
          await EmulatorAltService.launchWithLinking(
            titleId.trim(),
            customSettings,
            packageName.trim(),
          )
          break
        case 'launchOnly':
          await EmulatorAltService.launchAppOnly(packageName.trim())
          break
        case 'allPackages':
          await EmulatorAltService.tryDifferentPackageNames(titleId.trim(), customSettings)
          break
        default:
          throw new Error('Unknown method')
      }

      Alert.alert('Success', `Alternative method "${method}" worked!`)
    } catch (error) {
      console.error(`Alternative method ${method} failed:`, error)
      Alert.alert('Method Failed', `"${method}" method failed: ${getErrorMessage(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(getBaseDelay('instant')).duration(
              ANIMATION_CONFIG.timing.fast,
            )}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: theme.spacing.xl,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: theme.colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: theme.spacing.md,
                }}
              >
                <Ionicons name="game-controller" size={24} color={theme.colors.textInverse} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.xxl,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text,
                  }}
                >
                  Test Eden Emulator
                </Text>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.md,
                    color: theme.colors.textMuted,
                    marginTop: theme.spacing.xs,
                  }}
                >
                  Test custom game launches
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Information Card */}
          <Animated.View
            entering={FadeInUp.delay(getBaseDelay('fast')).duration(ANIMATION_CONFIG.timing.fast)}
          >
            <Card style={{ marginBottom: theme.spacing.lg }}>
              <View style={{ padding: theme.spacing.lg }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: theme.spacing.md,
                  }}
                >
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color={theme.colors.primary}
                    style={{ marginRight: theme.spacing.sm }}
                  />
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text,
                    }}
                  >
                    How to Use
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.md,
                    color: theme.colors.textMuted,
                    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
                  }}
                >
                  Enter a valid Nintendo Switch Title ID and GPU driver path to test launching games
                  with custom settings in the Eden emulator.
                </Text>
              </View>
            </Card>
          </Animated.View>

          {/* Form Fields */}
          <Animated.View
            entering={FadeInUp.delay(getBaseDelay('normal')).duration(ANIMATION_CONFIG.timing.fast)}
          >
            <Card style={{ marginBottom: theme.spacing.lg }}>
              <View style={{ padding: theme.spacing.lg }}>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text,
                    marginBottom: theme.spacing.lg,
                  }}
                >
                  Game Configuration
                </Text>

                {/* Title ID Field */}
                <View style={{ marginBottom: theme.spacing.lg }}>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.md,
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.colors.text,
                      marginBottom: theme.spacing.sm,
                    }}
                  >
                    Title ID
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textMuted,
                      marginBottom: theme.spacing.sm,
                    }}
                  >
                    16-digit hexadecimal string (e.g., 0100000000010000)
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      borderRadius: theme.borderRadius.md,
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.md,
                      fontSize: theme.typography.fontSize.md,
                      color: theme.colors.text,
                      fontFamily: 'monospace',
                    }}
                    value={titleId}
                    onChangeText={setTitleId}
                    placeholder="0100000000010000"
                    placeholderTextColor={theme.colors.textMuted}
                    maxLength={16}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </View>

                {/* Driver Path Field */}
                <View style={{ marginBottom: theme.spacing.lg }}>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.md,
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.colors.text,
                      marginBottom: theme.spacing.sm,
                    }}
                  >
                    GPU Driver Path
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textMuted,
                      marginBottom: theme.spacing.sm,
                    }}
                  >
                    GPU driver filename (automatically prepends base path)
                  </Text>
                  <View
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      borderRadius: theme.borderRadius.md,
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.md,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.textMuted,
                        fontFamily: 'monospace',
                      }}
                    >
                      .../gpu_drivers/
                    </Text>
                    <TextInput
                      style={{
                        flex: 1,
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.text,
                        fontFamily: 'monospace',
                        paddingVertical: 0,
                      }}
                      value={driverPath}
                      onChangeText={setDriverPath}
                      placeholder="custom.adpkg.zip"
                      placeholderTextColor={theme.colors.textMuted}
                      autoCorrect={false}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Package Name Field */}
                <View style={{ marginBottom: theme.spacing.lg }}>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.md,
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.colors.text,
                      marginBottom: theme.spacing.sm,
                    }}
                  >
                    Emulator Package Name
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textMuted,
                      marginBottom: theme.spacing.sm,
                    }}
                  >
                    Android package name of the emulator app
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      borderRadius: theme.borderRadius.md,
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.md,
                      fontSize: theme.typography.fontSize.md,
                      color: theme.colors.text,
                      fontFamily: 'monospace',
                    }}
                    value={packageName}
                    onChangeText={setPackageName}
                    placeholder="dev.eden.eden_emulator"
                    placeholderTextColor={theme.colors.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Action Buttons */}
                <View
                  style={{
                    flexDirection: isLandscape ? 'row' : 'column',
                    gap: theme.spacing.md,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  <Button
                    title="Preview Config"
                    onPress={() => setShowPreview(!showPreview)}
                    variant="outline"
                    size="lg"
                    style={{ flex: isLandscape ? 1 : undefined }}
                    leftIcon={
                      <Ionicons
                        name={showPreview ? 'eye-off' : 'eye'}
                        size={20}
                        color={theme.colors.primary}
                      />
                    }
                  />
                  <Button
                    title="Test Eden"
                    onPress={handleTestEden}
                    loading={isLoading}
                    disabled={isLoading || Platform.OS !== 'android'}
                    variant="primary"
                    size="lg"
                    style={{ flex: isLandscape ? 1 : undefined }}
                    leftIcon={<Ionicons name="play" size={20} color={theme.colors.textInverse} />}
                  />
                </View>

                {/* Debug Options Toggle */}
                <View style={{ marginTop: theme.spacing.md }}>
                  <Button
                    title={showDebugOptions ? 'Hide Debug Options' : 'Show Debug Options'}
                    onPress={() => setShowDebugOptions(!showDebugOptions)}
                    variant="ghost"
                    size="md"
                    leftIcon={<Ionicons name="bug" size={18} color={theme.colors.primary} />}
                  />
                </View>

                {Platform.OS !== 'android' && (
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textMuted,
                      textAlign: 'center',
                      marginTop: theme.spacing.md,
                      fontStyle: 'italic',
                    }}
                  >
                    Eden emulator testing is only available on Android
                  </Text>
                )}
              </View>
            </Card>
          </Animated.View>

          {/* Debug Options */}
          {showDebugOptions && (
            <Animated.View
              entering={FadeInUp.delay(getBaseDelay('fast')).duration(ANIMATION_CONFIG.timing.fast)}
            >
              <Card style={{ marginBottom: theme.spacing.lg }}>
                <View style={{ padding: theme.spacing.lg }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    <Ionicons
                      name="bug"
                      size={20}
                      color={theme.colors.primary}
                      style={{ marginRight: theme.spacing.sm }}
                    />
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.lg,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.text,
                      }}
                    >
                      Debug Options
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textMuted,
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    Try different launch methods if the main method fails
                  </Text>

                  <View style={{ gap: theme.spacing.sm }}>
                    <Button
                      title="Check Installation"
                      onPress={handleCheckInstallation}
                      variant="outline"
                      size="md"
                      leftIcon={
                        <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} />
                      }
                    />

                    <Button
                      title="Log Available Methods"
                      onPress={handleDebugMethods}
                      variant="outline"
                      size="md"
                      leftIcon={<Ionicons name="terminal" size={18} color={theme.colors.primary} />}
                    />

                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.medium,
                        color: theme.colors.text,
                        marginTop: theme.spacing.sm,
                        marginBottom: theme.spacing.xs,
                      }}
                    >
                      Alternative Launch Methods:
                    </Text>

                    <View
                      style={{
                        flexDirection: isLandscape ? 'row' : 'column',
                        gap: theme.spacing.sm,
                      }}
                    >
                      <Button
                        title="Try OpenApp"
                        onPress={() => handleTestAlternative('openApp')}
                        variant="secondary"
                        size="sm"
                        disabled={isLoading}
                        style={{ flex: isLandscape ? 1 : undefined }}
                      />
                      <Button
                        title="Try Intent URIs"
                        onPress={() => handleTestAlternative('linking')}
                        variant="secondary"
                        size="sm"
                        disabled={isLoading}
                        style={{ flex: isLandscape ? 1 : undefined }}
                      />
                    </View>

                    <View
                      style={{
                        flexDirection: isLandscape ? 'row' : 'column',
                        gap: theme.spacing.sm,
                      }}
                    >
                      <Button
                        title="Launch App Only"
                        onPress={() => handleTestAlternative('launchOnly')}
                        variant="secondary"
                        size="sm"
                        disabled={isLoading}
                        style={{ flex: isLandscape ? 1 : undefined }}
                      />
                      <Button
                        title="Try All Packages"
                        onPress={() => handleTestAlternative('allPackages')}
                        variant="secondary"
                        size="sm"
                        disabled={isLoading}
                        style={{ flex: isLandscape ? 1 : undefined }}
                      />
                    </View>
                  </View>
                </View>
              </Card>
            </Animated.View>
          )}

          {/* Debug Messages */}
          {debugMessages.length > 0 && (
            <Animated.View
              entering={FadeInUp.delay(getBaseDelay('fast')).duration(ANIMATION_CONFIG.timing.fast)}
            >
              <Card style={{ marginBottom: theme.spacing.lg }}>
                <View style={{ padding: theme.spacing.lg }}>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text,
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    Debug Output
                  </Text>
                  <ScrollView
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderRadius: theme.borderRadius.md,
                      padding: theme.spacing.md,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      maxHeight: 200,
                    }}
                    showsVerticalScrollIndicator={true}
                  >
                    {debugMessages.map((msg, index) => (
                      <Text
                        key={index}
                        style={{
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.text,
                          fontFamily: 'monospace',
                          marginBottom: theme.spacing.xs,
                        }}
                      >
                        {msg}
                      </Text>
                    ))}
                  </ScrollView>
                </View>
              </Card>
            </Animated.View>
          )}

          {/* Settings Preview */}
          {showPreview && (
            <Animated.View
              entering={FadeInUp.delay(getBaseDelay('fast')).duration(ANIMATION_CONFIG.timing.fast)}
            >
              <Card>
                <View style={{ padding: theme.spacing.lg }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    <Ionicons
                      name="document-text"
                      size={20}
                      color={theme.colors.primary}
                      style={{ marginRight: theme.spacing.sm }}
                    />
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.lg,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.text,
                      }}
                    >
                      Configuration Preview
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textMuted,
                      marginBottom: theme.spacing.sm,
                    }}
                  >
                    This configuration will be sent to Eden emulator:
                  </Text>
                  <ScrollView
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderRadius: theme.borderRadius.md,
                      padding: theme.spacing.md,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      maxHeight: 300,
                    }}
                    showsVerticalScrollIndicator={true}
                  >
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.text,
                        fontFamily: 'monospace',
                        lineHeight:
                          theme.typography.lineHeight.relaxed * theme.typography.fontSize.xs,
                      }}
                    >
                      {generateCustomSettings(driverPath)}
                    </Text>
                  </ScrollView>
                  <View
                    style={{
                      backgroundColor: `${theme.colors.primary}20`,
                      borderRadius: theme.borderRadius.sm,
                      padding: theme.spacing.sm,
                      marginTop: theme.spacing.sm,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.primary,
                        fontWeight: theme.typography.fontWeight.medium,
                        marginBottom: theme.spacing.xs,
                      }}
                    >
                      Full Driver Path: {getFullDriverPath(driverPath, packageName)}
                    </Text>
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.primary,
                        fontWeight: theme.typography.fontWeight.medium,
                      }}
                    >
                      Target Package: {packageName}
                    </Text>
                  </View>
                </View>
              </Card>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
