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
  Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'

import { useTheme } from '@/contexts/ThemeContext'
import { Button, Card } from '@/components/ui'
import { EmulatorService } from '@/lib/services/emulator'
import { getBaseDelay, ANIMATION_CONFIG } from '@/lib/animation/config'

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

  const extractTitleIdFromFilename = (filename: string): string => {
    // Remove file extension and check if it's a valid title ID
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
    if (EmulatorService.validateTitleId(nameWithoutExt)) {
      return nameWithoutExt
    }
    return ''
  }

  const handleFilePick = async () => {
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

      Alert.alert(
        'File Loaded',
        `Successfully loaded ${file.name}${titleId ? `\n\nDetected Title ID: ${titleId}` : '\n\nPlease enter the Title ID manually.'}`,
      )
    } catch (error) {
      console.error('Error picking file:', error)
      Alert.alert(
        'Error',
        `Failed to load configuration file. Please try again. 
        ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  const handleTestWithConfig = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert(
        'Platform Error',
        'Eden emulator testing is only available on Android devices.',
      )
      return
    }

    if (!configFile) {
      Alert.alert(
        'No Configuration',
        'Please select a configuration file first.',
      )
      return
    }

    const titleId = customTitleId || configFile.titleId

    if (!titleId.trim()) {
      Alert.alert('Missing Title ID', 'Please enter a Title ID.')
      return
    }

    if (!EmulatorService.validateTitleId(titleId)) {
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

      Alert.alert(
        'Launch Successful',
        `Emulator launch command sent successfully to ${packageName}!`,
      )
    } catch (error) {
      console.error('Error testing emulator:', error)

      if (error instanceof Error) {
        Alert.alert('Launch Error', error.message)
      } else {
        Alert.alert(
          'Launch Error',
          'An unexpected error occurred while testing the emulator.',
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearConfig = () => {
    Alert.alert(
      'Clear Configuration',
      'Are you sure you want to clear the current configuration?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setConfigFile(null)
            setCustomTitleId('')
            setShowContent(false)
          },
        },
      ],
    )
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
            paddingHorizontal: isLandscape
              ? theme.spacing.xl
              : theme.spacing.lg,
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
                <Ionicons
                  name="document-text"
                  size={24}
                  color={theme.colors.textInverse}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.xxl,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text,
                  }}
                >
                  Config File Tester
                </Text>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.md,
                    color: theme.colors.textMuted,
                    marginTop: theme.spacing.xs,
                  }}
                >
                  Upload and test INI configurations
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Information Card */}
          <Animated.View
            entering={FadeInUp.delay(getBaseDelay('fast')).duration(
              ANIMATION_CONFIG.timing.fast,
            )}
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
                    lineHeight:
                      theme.typography.lineHeight.relaxed *
                      theme.typography.fontSize.md,
                  }}
                >
                  Upload an INI configuration file (e.g., 0100000000010000.ini)
                  to test custom game settings. The app will try to detect the
                  Title ID from the filename.
                </Text>
              </View>
            </Card>
          </Animated.View>

          {/* File Upload Section */}
          <Animated.View
            entering={FadeInUp.delay(getBaseDelay('normal')).duration(
              ANIMATION_CONFIG.timing.fast,
            )}
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
                  Configuration File
                </Text>

                {/* File Picker */}
                <Pressable
                  onPress={handleFilePick}
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderWidth: 2,
                    borderColor: configFile
                      ? theme.colors.success
                      : theme.colors.border,
                    borderRadius: theme.borderRadius.md,
                    borderStyle: 'dashed',
                    padding: theme.spacing.xl,
                    alignItems: 'center',
                    marginBottom: theme.spacing.lg,
                  }}
                >
                  <Ionicons
                    name={configFile ? 'document-text' : 'cloud-upload'}
                    size={48}
                    color={
                      configFile ? theme.colors.success : theme.colors.textMuted
                    }
                    style={{ marginBottom: theme.spacing.md }}
                  />
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.md,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: configFile
                        ? theme.colors.success
                        : theme.colors.text,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {configFile ? configFile.name : 'Select INI File'}
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textMuted,
                      textAlign: 'center',
                    }}
                  >
                    {configFile
                      ? 'Tap to change file'
                      : 'Tap to browse for configuration files'}
                  </Text>
                </Pressable>

                {configFile && (
                  <>
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
                        {configFile.titleId
                          ? 'Auto-detected from filename'
                          : 'Enter the game Title ID'}
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
                        value={customTitleId}
                        onChangeText={setCustomTitleId}
                        placeholder={configFile.titleId || '0100000000010000'}
                        placeholderTextColor={theme.colors.textMuted}
                        maxLength={16}
                        autoCapitalize="characters"
                        autoCorrect={false}
                      />
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
                      }}
                    >
                      <Button
                        title={showContent ? 'Hide Content' : 'Show Content'}
                        onPress={() => setShowContent(!showContent)}
                        variant="outline"
                        size="lg"
                        style={{ flex: isLandscape ? 1 : undefined }}
                        leftIcon={
                          <Ionicons
                            name={showContent ? 'eye-off' : 'eye'}
                            size={20}
                            color={theme.colors.primary}
                          />
                        }
                      />
                      <Button
                        title="Clear Config"
                        onPress={handleClearConfig}
                        variant="secondary"
                        size="lg"
                        style={{ flex: isLandscape ? 1 : undefined }}
                        leftIcon={
                          <Ionicons
                            name="trash"
                            size={20}
                            color={theme.colors.text}
                          />
                        }
                      />
                      <Button
                        title="Test Config"
                        onPress={handleTestWithConfig}
                        loading={isLoading}
                        disabled={isLoading || Platform.OS !== 'android'}
                        variant="primary"
                        size="lg"
                        style={{ flex: isLandscape ? 1 : undefined }}
                        leftIcon={
                          <Ionicons
                            name="play"
                            size={20}
                            color={theme.colors.textInverse}
                          />
                        }
                      />
                    </View>
                  </>
                )}

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

          {/* Config Content Preview */}
          {configFile && showContent && (
            <Animated.View
              entering={FadeInUp.delay(getBaseDelay('fast')).duration(
                ANIMATION_CONFIG.timing.fast,
              )}
            >
              <Card>
                <View style={{ padding: theme.spacing.lg }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: theme.spacing.md,
                      justifyContent: 'space-between',
                    }}
                  >
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Ionicons
                        name="code"
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
                        Configuration Content
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.textMuted,
                      }}
                    >
                      {configFile.content.length} chars
                    </Text>
                  </View>
                  <ScrollView
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderRadius: theme.borderRadius.md,
                      padding: theme.spacing.md,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      maxHeight: 400,
                    }}
                    showsVerticalScrollIndicator={true}
                  >
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.text,
                        fontFamily: 'monospace',
                        lineHeight:
                          theme.typography.lineHeight.relaxed *
                          theme.typography.fontSize.xs,
                      }}
                    >
                      {configFile.content}
                    </Text>
                  </ScrollView>
                </View>
              </Card>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
