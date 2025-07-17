import { useAuth } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  Dimensions,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Animated, {
  BounceIn,
  Extrapolation,
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  ZoomIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import { GradientTitle, TypewriterText } from '@/components/themed/ThemedText'
import { HolographicView } from '@/components/themed/ThemedView'
import { Button, Card, SkeletonLoader } from '@/components/ui'
import FluidGradient from '@/components/ui/FluidGradient'
import { FloatingElement } from '@/components/ui/MicroInteractions'
import { useTheme } from '@/contexts/ThemeContext'
import { useCreateListing, useDevices, useEmulators, useGames } from '@/lib/api/hooks'
import type { Device, Game } from '@/types'

interface FormData {
  gameId: string | null
  deviceId: string | null
  emulatorId: string | null
  performanceId: string | null
  notes: string
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.2

export default function CreateScreen() {
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const { theme } = useTheme()
  const [currentStep, setCurrentStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState<FormData>({
    gameId: null,
    deviceId: null,
    emulatorId: null,
    performanceId: null,
    notes: '',
  })

  const gamesQuery = useGames({ search: searchQuery })
  const devicesQuery = useDevices({})
  const emulatorsQuery = useEmulators({})
  const createListingMutation = useCreateListing()

  // Enhanced 2025 animation values
  const fadeAnim = useSharedValue(1)
  const progressAnim = useSharedValue(0.2)
  const heroGlow = useSharedValue(0)
  const backgroundShift = useSharedValue(0)
  const stepFloat = useSharedValue(0)
  const particleFlow = useSharedValue(0)

  useEffect(() => {
    // Initialize cosmic background animation
    backgroundShift.value = withRepeat(
      withSequence(withTiming(1, { duration: 12000 }), withTiming(0, { duration: 12000 })),
      -1,
      true,
    )

    // Hero glow animation
    heroGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 2500 }), withTiming(0.4, { duration: 2500 })),
      -1,
      true,
    )

    // Step floating animation
    stepFloat.value = withRepeat(
      withSequence(withTiming(8, { duration: 5000 }), withTiming(-8, { duration: 5000 })),
      -1,
      true,
    )

    // Particle flow animation
    particleFlow.value = withRepeat(withTiming(1, { duration: 8000 }), -1, false)
  }, [])

  const steps = [
    { step: 1, title: 'Select Game', icon: 'game-controller', completed: !!formData.gameId },
    { step: 2, title: 'Choose Device', icon: 'phone-portrait', completed: !!formData.deviceId },
    { step: 3, title: 'Pick Emulator', icon: 'apps', completed: !!formData.emulatorId },
    { step: 4, title: 'Rate Performance', icon: 'star', completed: !!formData.performanceId },
    { step: 5, title: 'Add Notes', icon: 'create', completed: true },
  ]

  const performanceOptions = [
    {
      id: '49',
      label: 'Perfect',
      rank: 5,
      description: 'Runs flawlessly at full speed',
      color: theme.colors.performance.perfect,
      icon: 'checkmark-circle',
    },
    {
      id: '50',
      label: 'Great',
      rank: 4,
      description: 'Minor issues, very playable',
      color: theme.colors.performance.great,
      icon: 'checkmark',
    },
    {
      id: '51',
      label: 'Good',
      rank: 3,
      description: 'Some issues but playable',
      color: theme.colors.performance.good,
      icon: 'remove',
    },
    {
      id: '52',
      label: 'Poor',
      rank: 2,
      description: 'Major issues, barely playable',
      color: theme.colors.performance.poor,
      icon: 'warning',
    },
    {
      id: '53',
      label: 'Unplayable',
      rank: 1,
      description: 'Does not work',
      color: theme.colors.performance.unplayable,
      icon: 'close-circle',
    },
  ]

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }))

  const handleStepTransition = (nextStep: number) => {
    fadeAnim.value = withTiming(0, { duration: 150 }, () => {
      fadeAnim.value = withTiming(1, { duration: 150 })
    })
    progressAnim.value = withSpring(nextStep / 5)
    setCurrentStep(nextStep)
  }

  const handleNext = () => {
    if (currentStep < 5) {
      handleStepTransition(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      handleStepTransition(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!isSignedIn) {
      Alert.alert('Sign In Required', 'Please sign in to create a listing.')
      return
    }

    if (!formData.gameId || !formData.deviceId || !formData.emulatorId || !formData.performanceId) {
      Alert.alert('Incomplete Form', 'Please complete all required fields.')
      return
    }

    const performanceId = parseInt(formData.performanceId)
    if (isNaN(performanceId)) {
      Alert.alert('Error', 'Invalid performance rating selected.')
      return
    }

    try {
      const listing = await createListingMutation.mutateAsync({
        gameId: formData.gameId,
        deviceId: formData.deviceId,
        emulatorId: formData.emulatorId,
        performanceId,
        notes: formData.notes,
      })

      Alert.alert('Success!', 'Your listing has been created successfully.', [
        {
          text: 'View Listing',
          onPress: () => router.push(`/listing/${listing.id}`),
        },
        {
          text: 'Create Another',
          onPress: () => {
            setFormData({
              gameId: null,
              deviceId: null,
              emulatorId: null,
              performanceId: null,
              notes: '',
            })
            setCurrentStep(1)
            progressAnim.value = withSpring(0.2)
          },
        },
      ])
    } catch {
      Alert.alert('Error', 'Failed to create listing. Please try again.')
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.gameId
      case 2:
        return !!formData.deviceId
      case 3:
        return !!formData.emulatorId
      case 4:
        return !!formData.performanceId
      case 5:
        return true
      default:
        return false
    }
  }

  const fadeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }))

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View>
            <Text
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text,
                marginBottom: theme.spacing.sm,
              }}
            >
              Step 1: Select Game
            </Text>
            <Text
              style={{
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.lg,
                lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
              }}
            >
              Choose the game you want to create a performance listing for
            </Text>

            <View style={{ marginBottom: theme.spacing.lg }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.colors.surface,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: theme.borderRadius.lg,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.sm,
                  gap: theme.spacing.sm,
                }}
              >
                <Ionicons name="search" size={20} color={theme.colors.primary} />
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: theme.typography.fontSize.md,
                    color: theme.colors.text,
                    fontWeight: theme.typography.fontWeight.medium,
                  }}
                  placeholder="Search for games..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>
            </View>

            <View style={{ gap: theme.spacing.sm }}>
              {gamesQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Animated.View key={index} entering={FadeInUp.delay(index * 100).springify()}>
                    <Card style={{ padding: theme.spacing.md }}>
                      <SkeletonLoader
                        width="70%"
                        height={18}
                        style={{ marginBottom: theme.spacing.xs }}
                      />
                      <SkeletonLoader width="50%" height={14} />
                    </Card>
                  </Animated.View>
                ))
              ) : gamesQuery.data && gamesQuery.data.length > 0 ? (
                gamesQuery.data.slice(0, 10).map((game: Game, index: number) => (
                  <Animated.View
                    key={game.id}
                    entering={SlideInRight.delay(index * 50).springify()}
                  >
                    <Pressable
                      onPress={() => setFormData({ ...formData, gameId: game.id })}
                      style={({ pressed }) => [
                        {
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                    >
                      <Card
                        style={{
                          backgroundColor:
                            formData.gameId === game.id
                              ? `${theme.colors.primary}10`
                              : theme.colors.surface,
                          borderWidth: 2,
                          borderColor:
                            formData.gameId === game.id
                              ? theme.colors.primary
                              : theme.colors.border,
                        }}
                      >
                        <View style={{ padding: theme.spacing.md }}>
                          <Text
                            style={{
                              fontSize: theme.typography.fontSize.md,
                              fontWeight: theme.typography.fontWeight.semibold,
                              color: theme.colors.text,
                              marginBottom: theme.spacing.xs,
                            }}
                          >
                            {game.title}
                          </Text>
                          <Text
                            style={{
                              fontSize: theme.typography.fontSize.sm,
                              color: theme.colors.textMuted,
                            }}
                          >
                            {game.system?.name}
                          </Text>
                        </View>
                      </Card>
                    </Pressable>
                  </Animated.View>
                ))
              ) : (
                <View
                  style={{
                    paddingVertical: theme.spacing.xl,
                    alignItems: 'center',
                  }}
                >
                  <Ionicons
                    name="search-outline"
                    size={48}
                    color={theme.colors.textMuted}
                    style={{ marginBottom: theme.spacing.md }}
                  />
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.md,
                      color: theme.colors.textMuted,
                      textAlign: 'center',
                    }}
                  >
                    {searchQuery
                      ? 'No games found. Try a different search.'
                      : 'Start typing to search for games.'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )

      case 2:
        return (
          <View>
            <Text
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text,
                marginBottom: theme.spacing.sm,
              }}
            >
              Step 2: Choose Device
            </Text>
            <Text
              style={{
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.lg,
                lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
              }}
            >
              Select the device you tested the game on
            </Text>

            <View style={{ gap: theme.spacing.sm }}>
              {devicesQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Animated.View key={index} entering={FadeInUp.delay(index * 100).springify()}>
                    <Card style={{ padding: theme.spacing.md }}>
                      <SkeletonLoader
                        width="60%"
                        height={18}
                        style={{ marginBottom: theme.spacing.xs }}
                      />
                      <SkeletonLoader width="40%" height={14} />
                    </Card>
                  </Animated.View>
                ))
              ) : devicesQuery.data && devicesQuery.data.length > 0 ? (
                devicesQuery.data.map((device: Device, index: number) => (
                  <Animated.View
                    key={device.id}
                    entering={SlideInLeft.delay(index * 50).springify()}
                  >
                    <Pressable
                      onPress={() => setFormData({ ...formData, deviceId: device.id })}
                      style={({ pressed }) => [
                        {
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                    >
                      <Card
                        style={{
                          backgroundColor:
                            formData.deviceId === device.id
                              ? `${theme.colors.secondary}10`
                              : theme.colors.surface,
                          borderWidth: 2,
                          borderColor:
                            formData.deviceId === device.id
                              ? theme.colors.secondary
                              : theme.colors.border,
                        }}
                      >
                        <View style={{ padding: theme.spacing.md }}>
                          <Text
                            style={{
                              fontSize: theme.typography.fontSize.md,
                              fontWeight: theme.typography.fontWeight.semibold,
                              color: theme.colors.text,
                              marginBottom: theme.spacing.xs,
                            }}
                          >
                            {device.brand?.name} {device.modelName}
                          </Text>
                          <Text
                            style={{
                              fontSize: theme.typography.fontSize.sm,
                              color: theme.colors.textMuted,
                            }}
                          >
                            {device.soc?.name || 'Unknown SoC'}
                          </Text>
                        </View>
                      </Card>
                    </Pressable>
                  </Animated.View>
                ))
              ) : (
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.md,
                    color: theme.colors.textMuted,
                    textAlign: 'center',
                    paddingVertical: theme.spacing.xl,
                  }}
                >
                  No devices available.
                </Text>
              )}
            </View>
          </View>
        )

      case 3:
        return (
          <View>
            <Text
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text,
                marginBottom: theme.spacing.sm,
              }}
            >
              Step 3: Pick Emulator
            </Text>
            <Text
              style={{
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.lg,
                lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
              }}
            >
              Choose the emulator you used for testing
            </Text>

            <View style={{ gap: theme.spacing.sm }}>
              {emulatorsQuery.isLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <Animated.View key={index} entering={FadeInUp.delay(index * 100).springify()}>
                      <Card style={{ padding: theme.spacing.md }}>
                        <SkeletonLoader
                          width="50%"
                          height={18}
                          style={{ marginBottom: theme.spacing.xs }}
                        />
                        <SkeletonLoader width="70%" height={14} />
                      </Card>
                    </Animated.View>
                  ))
                : (
                    emulatorsQuery.data || [
                      { id: '1', name: 'RetroArch', description: 'Multi-system emulator' },
                      { id: '2', name: 'Dolphin', description: 'GameCube & Wii emulator' },
                      { id: '3', name: 'PCSX2', description: 'PlayStation 2 emulator' },
                      { id: '4', name: 'RPCS3', description: 'PlayStation 3 emulator' },
                      { id: '5', name: 'Citra', description: '3DS emulator' },
                    ]
                  ).map((emulator: any, index: number) => (
                    <Animated.View
                      key={emulator.id}
                      entering={SlideInRight.delay(index * 50).springify()}
                    >
                      <Pressable
                        onPress={() => setFormData({ ...formData, emulatorId: emulator.id })}
                        style={({ pressed }) => [
                          {
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                      >
                        <Card
                          style={{
                            backgroundColor:
                              formData.emulatorId === emulator.id
                                ? `${theme.colors.accent}10`
                                : theme.colors.surface,
                            borderWidth: 2,
                            borderColor:
                              formData.emulatorId === emulator.id
                                ? theme.colors.accent
                                : theme.colors.border,
                          }}
                        >
                          <View style={{ padding: theme.spacing.md }}>
                            <Text
                              style={{
                                fontSize: theme.typography.fontSize.md,
                                fontWeight: theme.typography.fontWeight.semibold,
                                color: theme.colors.text,
                                marginBottom: theme.spacing.xs,
                              }}
                            >
                              {emulator.name}
                            </Text>
                            <Text
                              style={{
                                fontSize: theme.typography.fontSize.sm,
                                color: theme.colors.textMuted,
                              }}
                            >
                              {emulator.description}
                            </Text>
                          </View>
                        </Card>
                      </Pressable>
                    </Animated.View>
                  ))}
            </View>
          </View>
        )

      case 4:
        return (
          <View>
            <Text
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text,
                marginBottom: theme.spacing.sm,
              }}
            >
              Step 4: Rate Performance
            </Text>
            <Text
              style={{
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.lg,
                lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
              }}
            >
              How well did the game perform on your setup?
            </Text>

            <View style={{ gap: theme.spacing.sm }}>
              {performanceOptions.map((option, index) => (
                <Animated.View key={option.id} entering={ZoomIn.delay(index * 100).springify()}>
                  <Pressable
                    onPress={() => setFormData({ ...formData, performanceId: option.id })}
                    style={({ pressed }) => [
                      {
                        opacity: pressed ? 0.9 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      },
                    ]}
                  >
                    <Card
                      style={{
                        backgroundColor:
                          formData.performanceId === option.id
                            ? `${option.color}20`
                            : theme.colors.surface,
                        borderWidth: 2,
                        borderColor:
                          formData.performanceId === option.id ? option.color : theme.colors.border,
                        overflow: 'hidden',
                      }}
                    >
                      <LinearGradient
                        colors={
                          formData.performanceId === option.id
                            ? [`${option.color}10`, 'transparent']
                            : ['transparent', 'transparent']
                        }
                        style={{ padding: theme.spacing.lg }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: theme.spacing.sm,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: theme.spacing.sm,
                            }}
                          >
                            <Ionicons name={option.icon as any} size={24} color={option.color} />
                            <Text
                              style={{
                                fontSize: theme.typography.fontSize.lg,
                                fontWeight: theme.typography.fontWeight.bold,
                                color: theme.colors.text,
                              }}
                            >
                              {option.label}
                            </Text>
                          </View>
                          <View
                            style={{
                              backgroundColor: option.color,
                              paddingHorizontal: theme.spacing.sm,
                              paddingVertical: theme.spacing.xs,
                              borderRadius: theme.borderRadius.sm,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: theme.typography.fontSize.xs,
                                fontWeight: theme.typography.fontWeight.bold,
                                color: theme.colors.textInverse,
                              }}
                            >
                              {'★'.repeat(option.rank)}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={{
                            fontSize: theme.typography.fontSize.sm,
                            color: theme.colors.textSecondary,
                            lineHeight:
                              theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
                          }}
                        >
                          {option.description}
                        </Text>
                      </LinearGradient>
                    </Card>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </View>
        )

      case 5:
        return (
          <View>
            <Text
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text,
                marginBottom: theme.spacing.sm,
              }}
            >
              Step 5: Add Notes (Optional)
            </Text>
            <Text
              style={{
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.lg,
                lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
              }}
            >
              Share any additional details about your experience
            </Text>

            <TextInput
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.md,
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
                textAlignVertical: 'top',
                marginBottom: theme.spacing.lg,
                minHeight: 120,
              }}
              placeholder="Add any notes about settings, issues, or tips..."
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              multiline
              numberOfLines={4}
              placeholderTextColor={theme.colors.textMuted}
            />

            <Card style={{ overflow: 'hidden' }}>
              <LinearGradient
                colors={theme.colors.gradients.card}
                style={{ padding: theme.spacing.lg }}
              >
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  Review Your Listing
                </Text>

                <View style={{ gap: theme.spacing.md }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: theme.spacing.md,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.md,
                        fontWeight: theme.typography.fontWeight.medium,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      Game:
                    </Text>
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.md,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.text,
                        flex: 1,
                        textAlign: 'right',
                      }}
                    >
                      {gamesQuery.data?.find((g: Game) => g.id === formData.gameId)?.title ||
                        'Selected'}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: theme.spacing.md,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.md,
                        fontWeight: theme.typography.fontWeight.medium,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      Device:
                    </Text>
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.md,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.text,
                        flex: 1,
                        textAlign: 'right',
                      }}
                    >
                      {devicesQuery.data?.find((d: Device) => d.id === formData.deviceId)
                        ?.modelName || 'Selected'}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.md,
                        fontWeight: theme.typography.fontWeight.medium,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      Performance:
                    </Text>
                    <View
                      style={{
                        backgroundColor:
                          performanceOptions.find((p) => p.id === formData.performanceId)?.color ||
                          theme.colors.primary,
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.xs,
                        borderRadius: theme.borderRadius.md,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: theme.typography.fontSize.sm,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.textInverse,
                        }}
                      >
                        {performanceOptions.find((p) => p.id === formData.performanceId)?.label ||
                          'Selected'}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </Card>
          </View>
        )

      default:
        return null
    }
  }

  // Animated styles - must be defined before any conditional returns
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(backgroundShift.value, [0, 1], [-30, 30], Extrapolation.CLAMP),
      },
    ],
  }))

  const heroGlowStyle = useAnimatedStyle(() => ({
    opacity: heroGlow.value,
  }))

  const stepFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: stepFloat.value }],
  }))

  const particleFlowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(particleFlow.value, [0, 1], [-150, 400], Extrapolation.CLAMP),
      },
    ],
    opacity: interpolate(particleFlow.value, [0, 0.2, 0.8, 1], [0, 1, 1, 0], Extrapolation.CLAMP),
  }))

  if (!isSignedIn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar
          barStyle={theme.isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.lg,
          }}
        >
          <Animated.View entering={ZoomIn.springify()}>
            <Card style={{ overflow: 'hidden', width: '100%' }}>
              <LinearGradient
                colors={theme.colors.gradients.primary}
                style={{
                  padding: theme.spacing.xxl,
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: theme.spacing.lg,
                  }}
                >
                  <Ionicons name="lock-closed" size={40} color={theme.colors.textInverse} />
                </View>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.xxl,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.textInverse,
                    marginBottom: theme.spacing.sm,
                    textAlign: 'center',
                  }}
                >
                  Sign In Required
                </Text>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.md,
                    color: `${theme.colors.textInverse}CC`,
                    textAlign: 'center',
                    marginBottom: theme.spacing.xl,
                    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
                  }}
                >
                  You need to be signed in to create listings and share your emulation experiences.
                </Text>
                <Button
                  title="Go to Profile"
                  variant="primary"
                  onPress={() => router.push('/(tabs)/profile')}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 2,
                    borderColor: theme.colors.textInverse,
                  }}
                />
              </LinearGradient>
            </Card>
          </Animated.View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Revolutionary Aurora Background */}
      <Animated.View style={[StyleSheet.absoluteFillObject, backgroundAnimatedStyle]}>
        <FluidGradient
          variant="cosmic"
          animated
          speed="slow"
          style={StyleSheet.absoluteFillObject}
          opacity={0.2}
        />
      </Animated.View>

      {/* Enhanced Gradient Overlay */}
      <LinearGradient
        colors={theme.colors.gradients.hero}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT + 100,
          opacity: 0.8,
        }}
      />

      {/* Floating Particles */}
      <Animated.View style={[styles.particle, { top: '15%' }, particleFlowStyle]}>
        <View style={[styles.particleDot, { backgroundColor: `${theme.colors.primary}50` }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, { top: '35%' }, particleFlowStyle]}>
        <View style={[styles.particleDot, { backgroundColor: `${theme.colors.secondary}50` }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, { top: '55%' }, particleFlowStyle]}>
        <View style={[styles.particleDot, { backgroundColor: `${theme.colors.accent}50` }]} />
      </Animated.View>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: theme.spacing.xxxl }}
        >
          {/* Revolutionary Hero Header */}
          <FloatingElement intensity={4} duration={5000}>
            <View style={styles.headerContainer}>
              {/* Hero glow effect */}
              <Animated.View style={[styles.headerGlow, heroGlowStyle]}>
                <LinearGradient
                  colors={['transparent', `${theme.colors.primary}40`, 'transparent']}
                  style={StyleSheet.absoluteFillObject}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>

              <Animated.View entering={SlideInLeft.delay(200).springify().damping(15)}>
                <GradientTitle animated style={styles.heroTitle}>
                  Create Listing
                </GradientTitle>

                <TypewriterText animated delay={300} style={styles.heroSubtitle}>
                  Share your emulation performance data with the community using next-gen precision
                </TypewriterText>
              </Animated.View>
            </View>
          </FloatingElement>

          {/* Revolutionary Progress Section */}
          <Animated.View
            entering={BounceIn.delay(400).springify().damping(12)}
            style={stepFloatStyle}
          >
            <FloatingElement intensity={2} duration={6000}>
              <View style={styles.progressContainer}>
                <HolographicView morphing borderRadius={24} style={styles.progressCard}>
                  <FluidGradient
                    variant="aurora"
                    borderRadius={24}
                    animated
                    speed="normal"
                    style={StyleSheet.absoluteFillObject}
                    opacity={0.15}
                  />

                  <View style={styles.progressContent}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: theme.spacing.md,
                      }}
                    >
                      {steps.map((step) => (
                        <View
                          key={step.step}
                          style={{
                            alignItems: 'center',
                            flex: 1,
                          }}
                        >
                          <View
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 24,
                              backgroundColor:
                                currentStep >= step.step
                                  ? theme.colors.primary
                                  : currentStep === step.step
                                    ? theme.colors.primary
                                    : theme.colors.surface,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: theme.spacing.sm,
                              borderWidth: 2,
                              borderColor:
                                currentStep >= step.step
                                  ? theme.colors.primary
                                  : theme.colors.border,
                            }}
                          >
                            <Ionicons
                              name={step.icon as any}
                              size={20}
                              color={
                                currentStep >= step.step
                                  ? theme.colors.textInverse
                                  : theme.colors.textMuted
                              }
                            />
                          </View>
                          <Text
                            style={{
                              fontSize: theme.typography.fontSize.xs,
                              fontWeight:
                                currentStep === step.step
                                  ? theme.typography.fontWeight.semibold
                                  : theme.typography.fontWeight.medium,
                              color:
                                currentStep === step.step
                                  ? theme.colors.text
                                  : theme.colors.textMuted,
                              textAlign: 'center',
                            }}
                          >
                            {step.title}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Progress Line */}
                    <View
                      style={{
                        height: 4,
                        backgroundColor: theme.colors.surface,
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <Animated.View
                        style={[
                          {
                            height: '100%',
                            backgroundColor: theme.colors.primary,
                            borderRadius: 2,
                          },
                          progressAnimatedStyle,
                        ]}
                      />
                    </View>
                  </View>
                </HolographicView>
              </View>
            </FloatingElement>
          </Animated.View>

          {/* Form Content */}
          <Animated.View
            style={[
              {
                paddingHorizontal: theme.spacing.lg,
                marginBottom: theme.spacing.xl,
              },
              fadeAnimatedStyle,
            ]}
          >
            <Card style={{ overflow: 'hidden' }}>
              <View style={{ padding: theme.spacing.lg }}>{renderStepContent()}</View>
            </Card>
          </Animated.View>

          {/* Navigation */}
          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              marginBottom: theme.spacing.xl,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                gap: theme.spacing.md,
              }}
            >
              {currentStep > 1 && (
                <Animated.View style={{ flex: 1 }} entering={SlideInLeft.springify()}>
                  <Button
                    title="Back"
                    variant="outline"
                    onPress={handleBack}
                    leftIcon={<Ionicons name="arrow-back" size={16} color={theme.colors.primary} />}
                  />
                </Animated.View>
              )}

              <Animated.View style={{ flex: 1 }} entering={SlideInRight.springify()}>
                {currentStep < 5 ? (
                  <Pressable
                    onPress={handleNext}
                    disabled={!canProceed()}
                    style={({ pressed }) => [
                      {
                        borderRadius: theme.borderRadius.lg,
                        opacity: !canProceed() ? 0.5 : pressed ? 0.8 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                        overflow: 'hidden',
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={theme.colors.gradients.primary}
                      style={{
                        paddingVertical: theme.spacing.md,
                        paddingHorizontal: theme.spacing.lg,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: theme.spacing.sm,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: theme.typography.fontSize.md,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.textInverse,
                        }}
                      >
                        Next
                      </Text>
                      <Ionicons name="arrow-forward" size={16} color={theme.colors.textInverse} />
                    </LinearGradient>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={handleSubmit}
                    disabled={createListingMutation.isPending}
                    style={({ pressed }) => [
                      {
                        borderRadius: theme.borderRadius.lg,
                        opacity: createListingMutation.isPending ? 0.5 : pressed ? 0.8 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                        overflow: 'hidden',
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={theme.colors.gradients.gaming}
                      style={{
                        paddingVertical: theme.spacing.md,
                        paddingHorizontal: theme.spacing.lg,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: theme.spacing.sm,
                      }}
                    >
                      {createListingMutation.isPending ? (
                        <Text
                          style={{
                            fontSize: theme.typography.fontSize.md,
                            fontWeight: theme.typography.fontWeight.semibold,
                            color: theme.colors.textInverse,
                          }}
                        >
                          Creating...
                        </Text>
                      ) : (
                        <>
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={theme.colors.textInverse}
                          />
                          <Text
                            style={{
                              fontSize: theme.typography.fontSize.md,
                              fontWeight: theme.typography.fontWeight.semibold,
                              color: theme.colors.textInverse,
                            }}
                          >
                            Create Listing
                          </Text>
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                )}
              </Animated.View>
            </View>
          </View>
        </ScrollView>
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
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    position: 'relative',
  },
  headerGlow: {
    position: 'absolute',
    top: 16,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
    position: 'relative',
    zIndex: 1,
  },
  heroSubtitle: {
    fontSize: 18,
    lineHeight: 28,
    position: 'relative',
    zIndex: 1,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  progressCard: {
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  progressContent: {
    position: 'relative',
    zIndex: 1,
  },
})
