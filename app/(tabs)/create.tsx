import React, { useState } from 'react'
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Animated,
} from 'react-native'
import { useAuth } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { Button, Card } from '@/components/ui'
import { useGames, useDevices, useCreateListing } from '@/lib/api/hooks'

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
  const [currentStep, setCurrentStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState<FormData>({
    gameId: null,
    deviceId: null,
    emulatorId: null,
    performanceId: null,
    notes: '',
  })

  const { data: games, isLoading: gamesLoading } = useGames(searchQuery)
  const { data: devices, isLoading: devicesLoading } = useDevices()
  const createListingMutation = useCreateListing()

  const fadeAnim = new Animated.Value(1)

  const steps = [
    { step: 1, title: 'Select Game', completed: !!formData.gameId },
    { step: 2, title: 'Choose Device', completed: !!formData.deviceId },
    { step: 3, title: 'Pick Emulator', completed: !!formData.emulatorId },
    { step: 4, title: 'Rate Performance', completed: !!formData.performanceId },
    { step: 5, title: 'Add Notes', completed: true },
  ]

  const performanceOptions = [
    {
      id: '1',
      label: 'Perfect',
      rank: 5,
      description: 'Runs flawlessly at full speed',
    },
    {
      id: '2',
      label: 'Great',
      rank: 4,
      description: 'Minor issues, very playable',
    },
    {
      id: '3',
      label: 'Good',
      rank: 3,
      description: 'Some issues but playable',
    },
    {
      id: '4',
      label: 'Poor',
      rank: 2,
      description: 'Major issues, barely playable',
    },
    { id: '5', label: 'Unplayable', rank: 1, description: 'Does not work' },
  ]

  const handleStepTransition = (nextStep: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start()
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

    if (
      !formData.gameId ||
      !formData.deviceId ||
      !formData.emulatorId ||
      !formData.performanceId
    ) {
      Alert.alert('Incomplete Form', 'Please complete all required fields.')
      return
    }

    try {
      const listing = await createListingMutation.mutateAsync({
        game: { id: formData.gameId! },
        device: { id: formData.deviceId! },
        emulator: { id: formData.emulatorId! },
        performance: { id: formData.performanceId! },
        notes: formData.notes,
      } as any)

      Alert.alert('Success!', 'Your listing has been created successfully.', [
        {
          text: 'View Listing',
          onPress: () => (router.push as any)(`/listing/${listing.id}`),
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
          },
        },
      ])
    } catch {
      Alert.alert('Error', 'Failed to create listing. Please try again.')
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View>
            <Text style={styles.formTitle}>Step 1: Select Game</Text>
            <Text style={styles.formDescription}>
              Choose the game you want to create a performance listing for
            </Text>

            <View style={styles.searchSection}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for games..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.optionsList}>
              {gamesLoading ? (
                <Text style={styles.loadingText}>Loading games...</Text>
              ) : games && games.length > 0 ? (
                games.slice(0, 10).map((game) => (
                  <Card
                    key={game.id}
                    style={StyleSheet.flatten([
                      styles.optionItem,
                      formData.gameId === game.id && styles.optionItemSelected,
                    ])}
                    padding="md"
                    onPress={() =>
                      setFormData({ ...formData, gameId: game.id })
                    }
                  >
                    <Text style={styles.optionTitle}>{game.title}</Text>
                    <Text style={styles.optionSubtitle}>
                      {game.system?.name}
                    </Text>
                  </Card>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? 'No games found. Try a different search.'
                    : 'Start typing to search for games.'}
                </Text>
              )}
            </View>
          </View>
        )

      case 2:
        return (
          <View>
            <Text style={styles.formTitle}>Step 2: Choose Device</Text>
            <Text style={styles.formDescription}>
              Select the device you tested the game on
            </Text>

            <View style={styles.optionsList}>
              {devicesLoading ? (
                <Text style={styles.loadingText}>Loading devices...</Text>
              ) : devices && devices.length > 0 ? (
                devices.map((device) => (
                  <Card
                    key={device.id}
                    style={StyleSheet.flatten([
                      styles.optionItem,
                      formData.deviceId === device.id &&
                        styles.optionItemSelected,
                    ])}
                    padding="md"
                    onPress={() =>
                      setFormData({ ...formData, deviceId: device.id })
                    }
                  >
                    <Text style={styles.optionTitle}>
                      {device.brand?.name} {device.modelName}
                    </Text>
                    <Text style={styles.optionSubtitle}>
                      {device.soc?.name || 'Unknown SoC'}
                    </Text>
                  </Card>
                ))
              ) : (
                <Text style={styles.emptyText}>No devices available.</Text>
              )}
            </View>
          </View>
        )

      case 3:
        return (
          <View>
            <Text style={styles.formTitle}>Step 3: Pick Emulator</Text>
            <Text style={styles.formDescription}>
              Choose the emulator you used for testing
            </Text>

            <View style={styles.optionsList}>
              {/* Mock emulator data for now */}
              {[
                {
                  id: '1',
                  name: 'RetroArch',
                  description: 'Multi-system emulator',
                },
                {
                  id: '2',
                  name: 'Dolphin',
                  description: 'GameCube & Wii emulator',
                },
                {
                  id: '3',
                  name: 'PCSX2',
                  description: 'PlayStation 2 emulator',
                },
                {
                  id: '4',
                  name: 'RPCS3',
                  description: 'PlayStation 3 emulator',
                },
                { id: '5', name: 'Citra', description: '3DS emulator' },
              ].map((emulator) => (
                <Card
                  key={emulator.id}
                  style={StyleSheet.flatten([
                    styles.optionItem,
                    formData.emulatorId === emulator.id &&
                      styles.optionItemSelected,
                  ])}
                  padding="md"
                  onPress={() =>
                    setFormData({ ...formData, emulatorId: emulator.id })
                  }
                >
                  <Text style={styles.optionTitle}>{emulator.name}</Text>
                  <Text style={styles.optionSubtitle}>
                    {emulator.description}
                  </Text>
                </Card>
              ))}
            </View>
          </View>
        )

      case 4:
        return (
          <View>
            <Text style={styles.formTitle}>Step 4: Rate Performance</Text>
            <Text style={styles.formDescription}>
              How well did the game perform on your setup?
            </Text>

            <View style={styles.optionsList}>
              {performanceOptions.map((option) => (
                <Card
                  key={option.id}
                  style={StyleSheet.flatten([
                    styles.optionItem,
                    formData.performanceId === option.id &&
                      styles.optionItemSelected,
                  ])}
                  padding="md"
                  onPress={() =>
                    setFormData({ ...formData, performanceId: option.id })
                  }
                >
                  <View style={styles.performanceOption}>
                    <View style={styles.performanceHeader}>
                      <Text style={styles.optionTitle}>{option.label}</Text>
                      <View style={styles.performanceRating}>
                        <Text style={styles.ratingText}>
                          {'⭐'.repeat(option.rank)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.optionSubtitle}>
                      {option.description}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )

      case 5:
        return (
          <View>
            <Text style={styles.formTitle}>Step 5: Add Notes (Optional)</Text>
            <Text style={styles.formDescription}>
              Share any additional details about your experience
            </Text>

            <TextInput
              style={styles.notesInput}
              placeholder="Add any notes about settings, issues, or tips..."
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              multiline
              numberOfLines={4}
              placeholderTextColor="#9ca3af"
            />

            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Review Your Listing</Text>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Game:</Text>
                <Text style={styles.summaryValue}>
                  {games?.find((g) => g.id === formData.gameId)?.title ||
                    'Selected'}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Device:</Text>
                <Text style={styles.summaryValue}>
                  {devices?.find((d) => d.id === formData.deviceId)
                    ?.modelName || 'Selected'}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Performance:</Text>
                <Text style={styles.summaryValue}>
                  {performanceOptions.find(
                    (p) => p.id === formData.performanceId,
                  )?.label || 'Selected'}
                </Text>
              </View>
            </View>
          </View>
        )

      default:
        return null
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

  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authRequired}>
          <Text style={styles.authTitle}>Sign In Required</Text>
          <Text style={styles.authDescription}>
            You need to be signed in to create listings and share your emulation
            experiences.
          </Text>
          <Button
            title="Go to Profile"
            variant="primary"
            onPress={() => router.push('/(tabs)/profile')}
          />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Listing</Text>
          <Text style={styles.subtitle}>
            Share your emulation performance data with the community
          </Text>
        </View>

        {/* Progress Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((item) => (
            <View key={item.step} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  item.completed && styles.stepCompleted,
                  item.step === currentStep && styles.stepActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    (item.completed || item.step === currentStep) &&
                      styles.stepNumberActive,
                  ]}
                >
                  {item.step}
                </Text>
              </View>
              <Text
                style={[
                  styles.stepTitle,
                  item.step === currentStep && styles.stepTitleActive,
                ]}
              >
                {item.title}
              </Text>
            </View>
          ))}
        </View>

        {/* Form Content */}
        <Animated.View style={[styles.formCard, { opacity: fadeAnim }]}>
          <Card padding="lg">{renderStepContent()}</Card>
        </Animated.View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <View style={styles.navButtons}>
            {currentStep > 1 && (
              <Button
                title="Back"
                variant="outline"
                onPress={handleBack}
                style={styles.navButton}
              />
            )}

            {currentStep < 5 ? (
              <Button
                title="Next"
                variant="primary"
                onPress={handleNext}
                disabled={!canProceed()}
                style={styles.navButton}
              />
            ) : (
              <Button
                title="Create Listing"
                variant="primary"
                onPress={handleSubmit}
                loading={createListingMutation.isPending}
                style={styles.navButton}
              />
            )}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  authRequired: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  authDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  stepsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepCompleted: {
    backgroundColor: '#10b981',
  },
  stepActive: {
    backgroundColor: '#3b82f6',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  stepNumberActive: {
    color: '#ffffff',
  },
  stepTitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  stepTitleActive: {
    color: '#111827',
    fontWeight: '600',
  },
  formCard: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  searchSection: {
    marginBottom: 24,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionItemSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  performanceOption: {
    width: '100%',
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  performanceRating: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
    textAlignVertical: 'top',
    marginBottom: 24,
    minHeight: 100,
  },
  summarySection: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  navigation: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
  },
  bottomSpacing: {
    height: 100,
  },
})
