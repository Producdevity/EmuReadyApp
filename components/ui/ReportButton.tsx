import React, { useState } from 'react'
import { TouchableOpacity, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import ReportListingModal from '@/components/modals/ReportListingModal'

interface ReportButtonProps {
  listingId: string
  listingTitle?: string
  variant?: 'button' | 'menu-item'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  onPress?: () => void
}

export default function ReportButton({
  listingId,
  listingTitle,
  variant = 'button',
  size = 'md',
  showText = true,
  onPress,
}: ReportButtonProps) {
  const { theme } = useTheme()
  const [showReportModal, setShowReportModal] = useState(false)

  const handlePress = () => {
    onPress?.()
    setShowReportModal(true)
  }

  const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24
  const textSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'

  if (variant === 'menu-item') {
    return (
      <>
        <TouchableOpacity onPress={handlePress} className="flex-row items-center py-3 px-4">
          <Ionicons name="flag-outline" size={iconSize} color={theme.colors.error} />
          {showText && (
            <Text className={`ml-3 ${textSize}`} style={{ color: theme.colors.error }}>
              Report Listing
            </Text>
          )}
        </TouchableOpacity>

        <ReportListingModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          listingId={listingId}
          listingTitle={listingTitle}
        />
      </>
    )
  }

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        className={`flex-row items-center justify-center px-3 py-2 rounded-lg border ${
          size === 'sm' ? 'px-2 py-1' : ''
        }`}
        style={{
          borderColor: theme.colors.error,
          backgroundColor: 'transparent',
        }}
      >
        <Ionicons name="flag-outline" size={iconSize} color={theme.colors.error} />
        {showText && (
          <Text className={`ml-2 font-medium ${textSize}`} style={{ color: theme.colors.error }}>
            Report
          </Text>
        )}
      </TouchableOpacity>

      <ReportListingModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        listingId={listingId}
        listingTitle={listingTitle}
      />
    </>
  )
}
