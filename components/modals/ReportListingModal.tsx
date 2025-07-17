import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useTheme } from '@/contexts/ThemeContext'
import { useCreateListingReport } from '@/lib/api/hooks'
import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

interface ReportListingModalProps {
  visible: boolean
  onClose: () => void
  listingId: string
  listingTitle?: string
}

const REPORT_REASONS = [
  {
    value: 'inappropriate_content',
    label: 'Inappropriate Content',
    description: 'Contains offensive or inappropriate material',
  },
  { value: 'spam', label: 'Spam', description: 'Repetitive or irrelevant content' },
  {
    value: 'false_information',
    label: 'False Information',
    description: 'Contains misleading or incorrect data',
  },
  {
    value: 'copyright_violation',
    label: 'Copyright Violation',
    description: 'Unauthorized use of copyrighted material',
  },
  {
    value: 'harassment',
    label: 'Harassment',
    description: 'Content that harasses or targets users',
  },
  { value: 'duplicate', label: 'Duplicate Listing', description: 'This listing already exists' },
  { value: 'other', label: 'Other', description: 'Other reason not listed above' },
]

export default function ReportListingModal({
  visible,
  onClose,
  listingId,
  listingTitle,
}: ReportListingModalProps) {
  const { theme } = useTheme()
  const [selectedReason, setSelectedReason] = useState('')
  const [description, setDescription] = useState('')

  const reportMutation = useCreateListingReport({
    onSuccess: (data) => {
      Alert.alert(
        'Report Submitted',
        data.message || 'Thank you for your report. Our moderation team will review it.',
        [{ text: 'OK', onPress: handleClose }],
      )
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to submit report. Please try again.')
    },
  })

  const handleClose = () => {
    setSelectedReason('')
    setDescription('')
    onClose()
  }

  const handleSubmit = () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for reporting this listing.')
      return
    }

    if (selectedReason === 'other' && !description.trim()) {
      Alert.alert('Error', 'Please provide a description when selecting "Other" as the reason.')
      return
    }

    reportMutation.mutate({
      listingId,
      reason: selectedReason,
      description: description.trim() || undefined,
    })
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Header */}
        <View
          className="px-4 py-4 border-b flex-row justify-between items-center"
          style={{ borderBottomColor: theme.colors.border }}
        >
          <View className="flex-1">
            <Text className="text-xl font-bold" style={{ color: theme.colors.text }}>
              Report Listing
            </Text>
            {listingTitle && (
              <Text className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                {listingTitle}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleClose}
            className="p-2"
            disabled={reportMutation.isPending}
          >
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4">
            {/* Instructions */}
            <Card style={{ marginBottom: theme.spacing.xl }}>
              <View className="p-4">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                  <Text className="text-lg font-semibold ml-2" style={{ color: theme.colors.text }}>
                    Why are you reporting this listing?
                  </Text>
                </View>
                <Text style={{ color: theme.colors.textSecondary, lineHeight: 20 }}>
                  Your report helps keep our community safe and ensures content quality. Please
                  select the most appropriate reason below.
                </Text>
              </View>
            </Card>

            {/* Report Reasons */}
            <View className="space-y-3">
              {REPORT_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason.value}
                  onPress={() => setSelectedReason(reason.value)}
                  disabled={reportMutation.isPending}
                >
                  <Card
                    style={{
                      borderColor:
                        selectedReason === reason.value
                          ? theme.colors.primary
                          : theme.colors.border,
                      borderWidth: selectedReason === reason.value ? 2 : 1,
                    }}
                  >
                    <View className="p-4">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="font-semibold mb-1" style={{ color: theme.colors.text }}>
                            {reason.label}
                          </Text>
                          <Text className="text-sm" style={{ color: theme.colors.textSecondary }}>
                            {reason.description}
                          </Text>
                        </View>
                        <View
                          className={`w-6 h-6 rounded-full border-2 ml-3 ${
                            selectedReason === reason.value ? 'justify-center items-center' : ''
                          }`}
                          style={{
                            borderColor:
                              selectedReason === reason.value
                                ? theme.colors.primary
                                : theme.colors.border,
                            backgroundColor:
                              selectedReason === reason.value
                                ? theme.colors.primary
                                : 'transparent',
                          }}
                        >
                          {selectedReason === reason.value && (
                            <Ionicons name="checkmark" size={12} color="#fff" />
                          )}
                        </View>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>

            {/* Additional Description */}
            <Card style={{ marginTop: theme.spacing.xl }}>
              <View className="p-4">
                <Text className="text-lg font-semibold mb-3" style={{ color: theme.colors.text }}>
                  Additional Details{' '}
                  {selectedReason === 'other' && (
                    <Text style={{ color: theme.colors.error }}>*</Text>
                  )}
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder={
                    selectedReason === 'other'
                      ? 'Please describe the issue...'
                      : 'Provide any additional context (optional)...'
                  }
                  multiline
                  numberOfLines={4}
                  style={{
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    textAlignVertical: 'top',
                    minHeight: 100,
                    borderWidth: 1,
                    borderRadius: theme.borderRadius.lg,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.md,
                  }}
                  placeholderTextColor={theme.colors.textSecondary}
                  editable={!reportMutation.isPending}
                />
              </View>
            </Card>

            {/* Submit Buttons */}
            <View className="pt-6 pb-8">
              <Button
                title="Submit Report"
                onPress={handleSubmit}
                variant="primary"
                disabled={reportMutation.isPending || !selectedReason}
                leftIcon={
                  reportMutation.isPending ? (
                    <ActivityIndicator size={16} color="#fff" />
                  ) : (
                    <Ionicons name="flag" size={20} color="#fff" />
                  )
                }
              />

              <Button
                title="Cancel"
                onPress={handleClose}
                variant="outline"
                style={{ marginTop: theme.spacing.md }}
                disabled={reportMutation.isPending}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    position: 'relative',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
    zIndex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  instructionsCard: {
    marginBottom: 24,
  },
  instructionsContent: {
    padding: 20,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reasonsContainer: {
    gap: 12,
  },
  reasonCard: {
    marginBottom: 8,
  },
  reasonCardContent: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  reasonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    position: 'relative',
    zIndex: 1,
  },
  reasonLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reasonDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  descriptionCard: {
    marginTop: 24,
  },
  descriptionContent: {
    padding: 20,
  },
  textInputContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  textInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    padding: 16,
    fontSize: 16,
    lineHeight: 22,
  },
  buttonsContainer: {
    paddingTop: 24,
    paddingBottom: 32,
    gap: 12,
  },
  submitButton: {
    marginBottom: 0,
  },
  cancelButton: {
    marginTop: 0,
  },
})
