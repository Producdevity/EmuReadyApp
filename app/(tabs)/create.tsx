import { useAuth } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  Alert,
  Pressable,
  TextInput,
  View,
} from 'react-native'
import Animated, {
  BounceIn,
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import { ThemedText } from '@/components/themed'
import { GlassView } from '@/components/themed/ThemedView'
import { Button, Card, SkeletonLoader, ScreenLayout, ScreenHeader } from '@/components/ui'
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

  // Simplified animation values
  const fadeAnim = useSharedValue(1)
  const progressAnim = useSharedValue(0.2)

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
      'worklet'
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
            <ThemedText
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text,
                marginBottom: theme.spacing.sm,
              }}
            >
              Step 1: Select Game
            </ThemedText>
            <ThemedText
              style={{
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.lg,
                lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
              }}
            >
              Choose the game you want to create a performance listing for
            </ThemedText>

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
                          <ThemedText
                            type="defaultSemiBold"
                            style={{
                              fontSize: theme.typography.fontSize.md,
                              marginBottom: theme.spacing.xs,
                            }}
                          >
                            {game.title}
                          </ThemedText>
                          <ThemedText
                            type="caption"
                            style={{
                              fontSize: theme.typography.fontSize.sm,
                              color: theme.colors.textMuted,
                            }}
                          >
                            {game.system?.name}
                          </ThemedText>
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
                  <ThemedText
                    type="subtitle"
                    style={{
                      fontSize: theme.typography.fontSize.md,
                      color: theme.colors.textMuted,
                      textAlign: 'center',
                    }}
                  >
                    {searchQuery
                      ? 'No games found. Try a different search.'
                      : 'Start typing to search for games.'}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        )

      case 2:
        return (
          <View>
            <ThemedText
              type="title"
              style={{
                fontSize: theme.typography.fontSize.xl,
                marginBottom: theme.spacing.sm,
              }}
            >
              Step 2: Choose Device
            </ThemedText>
            <ThemedText
              type="subtitle"
              style={{
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.lg,
                lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
              }}
            >
              Select the device you tested the game on
            </ThemedText>

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
                          <ThemedText
                            type="defaultSemiBold"
                            style={{
                              fontSize: theme.typography.fontSize.md,
                              marginBottom: theme.spacing.xs,
                            }}
                          >
                            {device.brand?.name} {device.modelName}
                          </ThemedText>
                          <ThemedText
                            type="caption"
                            style={{
                              fontSize: theme.typography.fontSize.sm,
                              color: theme.colors.textMuted,
                            }}
                          >
                            {device.soc?.name || 'Unknown SoC'}
                          </ThemedText>
                        </View>
                      </Card>
                    </Pressable>
                  </Animated.View>
                ))
              ) : (
                <ThemedText
                  type="subtitle"
                  style={{
                    fontSize: theme.typography.fontSize.md,
                    color: theme.colors.textMuted,
                    textAlign: 'center',
                    paddingVertical: theme.spacing.xl,
                  }}
                >
                  No devices available.
                </ThemedText>
              )}
            </View>
          </View>
        )

      case 3:
        return (
          <View>
            <ThemedText
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text,
                marginBottom: theme.spacing.sm,
              }}
            >
              Step 3: Pick Emulator
            </ThemedText>
            <ThemedText
              style={{
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.lg,
                lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
              }}
            >
              Choose the emulator you used for testing
            </ThemedText>

            <View style={{ gap: theme.spacing.sm }}>
              {emulatorsQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
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
              ) : emulatorsQuery.data && emulatorsQuery.data.length > 0 ? (
                emulatorsQuery.data.map((emulator: any, index: number) => (
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
                            <ThemedText
                              style={{
                                fontSize: theme.typography.fontSize.md,
                                fontWeight: theme.typography.fontWeight.semibold,
                                color: theme.colors.text,
                                marginBottom: theme.spacing.xs,
                              }}
                            >
                              {emulator.name}
                            </ThemedText>
                            <ThemedText
                              style={{
                                fontSize: theme.typography.fontSize.sm,
                                color: theme.colors.textMuted,
                              }}
                            >
                              {emulator.description}
                            </ThemedText>
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
                    name="apps-outline"
                    size={48}
                    color={theme.colors.textMuted}
                    style={{ marginBottom: theme.spacing.md }}
                  />
                  <ThemedText
                    style={{
                      fontSize: theme.typography.fontSize.md,
                      color: theme.colors.textMuted,
                      textAlign: 'center',
                    }}
                  >
                    {emulatorsQuery.error ? 'Failed to load emulators. Please try again.' : 'No emulators available.'}
                  </ThemedText>
                  {emulatorsQuery.error && (
                    <Button
                      title="Retry"
                      variant="outline"
                      size="sm"
                      onPress={() => emulatorsQuery.refetch()}
                      style={{ marginTop: theme.spacing.md }}
                    />
                  )}
                </View>
              )}
            </View>
          </View>
        )

      case 4:
        return (
          <View>
            <ThemedText
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text,
                marginBottom: theme.spacing.sm,
              }}
            >
              Step 4: Rate Performance
            </ThemedText>
            <ThemedText
              style={{
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.lg,
                lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
              }}
            >
              How well did the game perform on your setup?
            </ThemedText>

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
                            <ThemedText
                              style={{
                                fontSize: theme.typography.fontSize.lg,
                                fontWeight: theme.typography.fontWeight.bold,
                                color: theme.colors.text,
                              }}
                            >
                              {option.label}
                            </ThemedText>
                          </View>
                          <View
                            style={{
                              backgroundColor: option.color,
                              paddingHorizontal: theme.spacing.sm,
                              paddingVertical: theme.spacing.xs,
                              borderRadius: theme.borderRadius.sm,
                            }}
                          >
                            <ThemedText
                              style={{
                                fontSize: theme.typography.fontSize.xs,
                                fontWeight: theme.typography.fontWeight.bold,
                                color: theme.colors.textInverse,
                              }}
                            >
                              {'★'.repeat(option.rank)}
                            </ThemedText>
                          </View>
                        </View>
                        <ThemedText
                          style={{
                            fontSize: theme.typography.fontSize.sm,
                            color: theme.colors.textSecondary,
                            lineHeight:
                              theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
                          }}
                        >
                          {option.description}
                        </ThemedText>
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
            <ThemedText
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text,
                marginBottom: theme.spacing.sm,
              }}
            >
              Step 5: Add Notes (Optional)
            </ThemedText>
            <ThemedText
              style={{
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.lg,
                lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
              }}
            >
              Share any additional details about your experience
            </ThemedText>

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
                <ThemedText
                  style={{
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  Review Your Listing
                </ThemedText>

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
                    <ThemedText
                      style={{
                        fontSize: theme.typography.fontSize.md,
                        fontWeight: theme.typography.fontWeight.medium,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      Game:
                    </ThemedText>
                    <ThemedText
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
                    </ThemedText>
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
                    <ThemedText
                      style={{
                        fontSize: theme.typography.fontSize.md,
                        fontWeight: theme.typography.fontWeight.medium,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      Device:
                    </ThemedText>
                    <ThemedText
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
                    </ThemedText>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <ThemedText
                      style={{
                        fontSize: theme.typography.fontSize.md,
                        fontWeight: theme.typography.fontWeight.medium,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      Performance:
                    </ThemedText>
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
                      <ThemedText
                        style={{
                          fontSize: theme.typography.fontSize.sm,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.textInverse,
                        }}
                      >
                        {performanceOptions.find((p) => p.id === formData.performanceId)?.label ||
                          'Selected'}
                      </ThemedText>
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


  if (!isSignedIn) {
    return (
      <ScreenLayout scrollable={false}>
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
                <ThemedText
                  type="title"
                  style={{
                    fontSize: theme.typography.fontSize.xxl,
                    color: theme.colors.textInverse,
                    marginBottom: theme.spacing.sm,
                    textAlign: 'center',
                  }}
                >
                  Sign In Required
                </ThemedText>
                <ThemedText
                  type="subtitle"
                  style={{
                    fontSize: theme.typography.fontSize.md,
                    color: `${theme.colors.textInverse}CC`,
                    textAlign: 'center',
                    marginBottom: theme.spacing.xl,
                    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
                  }}
                >
                  You need to be signed in to create listings and share your emulation experiences.
                </ThemedText>
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
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout>
          {/* Header */}
          <ScreenHeader
            title="Create Listing"
            subtitle="Share your emulation performance data with the community"
            variant="default"
            animated
          />
          

          {/* Progress Section */}
          <Animated.View
            entering={BounceIn.delay(400).springify().damping(12)}
            style={{
              paddingHorizontal: theme.spacing.lg,
              marginBottom: theme.spacing.xl,
            }}
          >
            <GlassView style={{
              padding: theme.spacing.lg,
            }}>
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
                          <ThemedText
                            type="caption"
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
                          </ThemedText>
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
            </GlassView>
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
                      <ThemedText
                        type="defaultSemiBold"
                        style={{
                          fontSize: theme.typography.fontSize.md,
                          color: theme.colors.textInverse,
                        }}
                      >
                        Next
                      </ThemedText>
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
                        <ThemedText
                          type="defaultSemiBold"
                          style={{
                            fontSize: theme.typography.fontSize.md,
                            color: theme.colors.textInverse,
                          }}
                        >
                          Creating...
                        </ThemedText>
                      ) : (
                        <>
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={theme.colors.textInverse}
                          />
                          <ThemedText
                            type="defaultSemiBold"
                            style={{
                              fontSize: theme.typography.fontSize.md,
                              color: theme.colors.textInverse,
                            }}
                          >
                            Create Listing
                          </ThemedText>
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                )}
              </Animated.View>
            </View>
          </View>
    </ScreenLayout>
  )
}

