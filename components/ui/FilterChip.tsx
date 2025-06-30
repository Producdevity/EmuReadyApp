import React, { memo } from 'react'
import {
  Pressable,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'

interface FilterChipProps {
  label: string
  value: string | number
  isSelected: boolean
  onPress: (value: string | number) => void
  variant?: 'default' | 'outline' | 'pill'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  icon?: keyof typeof Ionicons.glyphMap
  style?: ViewStyle
  textStyle?: TextStyle
}

const FilterChip: React.FC<FilterChipProps> = memo(function FilterChip({
  label,
  value,
  isSelected,
  onPress,
  variant = 'default',
  size = 'medium',
  disabled = false,
  icon,
  style,
  textStyle: _textStyle,
}) {
  const { theme } = useTheme()
  const scale = useSharedValue(1)
  const animationValue = useSharedValue(isSelected ? 1 : 0)
  
  const styles = createStyles(theme, variant, size)

  React.useEffect(() => {
    animationValue.value = withSpring(isSelected ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    })
  }, [isSelected, animationValue])

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 350 })
    }
  }

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, { damping: 15, stiffness: 350 })
    }
  }

  const handlePress = () => {
    if (!disabled) {
      onPress(value)
    }
  }

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animationValue.value,
      [0, 1],
      [
        variant === 'outline' ? 'transparent' : theme.colors.surface,
        theme.colors.primary
      ]
    )

    const borderColor = interpolateColor(
      animationValue.value,
      [0, 1],
      [theme.colors.border, theme.colors.primary]
    )

    return {
      backgroundColor,
      borderColor,
      transform: [{ scale: scale.value }],
      opacity: disabled ? 0.5 : 1,
    }
  })

  const animatedTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      animationValue.value,
      [0, 1],
      [theme.colors.text, '#ffffff']
    )

    return {
      color,
    }
  })

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[styles.container, animatedStyle, style]}>
        {icon && (
          <Animated.View style={styles.iconContainer}>
            <Ionicons 
              name={icon} 
              size={16} 
              color={isSelected ? '#ffffff' : theme.colors.textSecondary}
            />
          </Animated.View>
        )}
        <Animated.Text style={[styles.text, animatedTextStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  )
})

interface FilterChipGroupProps {
  options: { label: string; value: string | number }[]
  selectedValue: string | number | null
  onSelectionChange: (value: string | number | null) => void
  variant?: FilterChipProps['variant']
  size?: FilterChipProps['size']
  allowMultiple?: boolean
  style?: ViewStyle
}

export const FilterChipGroup: React.FC<FilterChipGroupProps> = memo(function FilterChipGroup({
  options,
  selectedValue,
  onSelectionChange,
  variant = 'default',
  size = 'medium',
  allowMultiple = false,
  style,
}) {
  const handlePress = (value: string | number) => {
    if (allowMultiple) {
      // Multi-select logic would go here
      onSelectionChange(value)
    } else {
      onSelectionChange(selectedValue === value ? null : value)
    }
  }

  return (
    <Animated.View style={[styles.groupContainer, style]}>
      {options.map((option, index) => (
        <FilterChip
          key={`${option.value}-${index}`}
          label={option.label}
          value={option.value}
          isSelected={selectedValue === option.value}
          onPress={handlePress}
          variant={variant}
          size={size}
          style={styles.groupItem}
        />
      ))}
    </Animated.View>
  )
})

const createStyles = (theme: any, variant: string, size: string) => {
  const sizeConfig = {
    small: { padding: 8, fontSize: 12, borderRadius: 16 },
    medium: { padding: 12, fontSize: 14, borderRadius: 20 },
    large: { padding: 16, fontSize: 16, borderRadius: 24 },
  }

  const config = sizeConfig[size as keyof typeof sizeConfig] || sizeConfig.medium

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: config.padding,
      paddingVertical: config.padding * 0.6,
      borderRadius: config.borderRadius,
      borderWidth: variant === 'outline' ? 1 : 0,
      marginRight: 8,
      marginBottom: 8,
    },
    iconContainer: {
      marginRight: 6,
    },
    text: {
      fontSize: config.fontSize,
      fontWeight: '500',
      textAlign: 'center',
    },
    groupContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 8,
    },
    groupItem: {
      marginRight: 8,
      marginBottom: 8,
    },
  })
}

const styles = StyleSheet.create({
  groupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  groupItem: {
    marginRight: 8,
    marginBottom: 8,
  },
})

export default FilterChip