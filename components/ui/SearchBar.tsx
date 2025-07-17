import { useTheme } from '@/contexts/ThemeContext'
import { Ionicons } from '@expo/vector-icons'
import React, { memo, useEffect, useRef } from 'react'
import { Pressable, StyleSheet, TextInput, type TextInputProps, type ViewStyle } from 'react-native'
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  containerStyle?: ViewStyle
  showClearButton?: boolean
  autoFocus?: boolean
  variant?: 'default' | 'prominent'
}

const SearchBar: React.FC<SearchBarProps> = memo(function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  containerStyle,
  showClearButton = true,
  autoFocus = false,
  variant = 'default',
  ...textInputProps
}) {
  const { theme } = useTheme()
  const inputRef = useRef<TextInput>(null)
  const focusValue = useSharedValue(0)

  const styles = createStyles(theme)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleFocus = () => {
    focusValue.value = withSpring(1, { damping: 15, stiffness: 150 })
  }

  const handleBlur = () => {
    focusValue.value = withSpring(0, { damping: 15, stiffness: 150 })
  }

  const handleClear = () => {
    onChangeText('')
    inputRef.current?.focus()
  }

  const animatedContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusValue.value,
      [0, 1],
      [theme.colors.border, theme.colors.primary],
    )

    return {
      borderColor,
      transform: [{ scale: withSpring(focusValue.value === 1 ? 1.02 : 1) }],
      shadowOpacity: withSpring(focusValue.value === 1 ? 0.1 : 0.05),
    }
  })

  const containerVariantStyle =
    variant === 'prominent' ? styles.prominentContainer : styles.defaultContainer

  return (
    <Animated.View
      style={[styles.container, containerVariantStyle, animatedContainerStyle, containerStyle]}
    >
      <Ionicons
        name="search"
        size={20}
        color={theme.colors.textSecondary}
        style={styles.searchIcon}
      />

      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
        clearButtonMode="never"
        {...textInputProps}
      />

      {showClearButton && value.length > 0 && (
        <Pressable onPress={handleClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
        </Pressable>
      )}
    </Animated.View>
  )
})

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    defaultContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 16,
    },
    prominentContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      marginBottom: 20,
      borderRadius: 20,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    searchIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      paddingVertical: 0,
    },
    clearButton: {
      marginLeft: 8,
      padding: 4,
    },
  })

export default SearchBar
