import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import Animated, {
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import { Button } from '@/components/ui'
import { useTheme } from '@/contexts/ThemeContext'
import { useUpdateProfile } from '@/lib/api/hooks'
import { useUser } from '@clerk/clerk-expo'

interface EditProfileModalProps {
  visible: boolean
  onClose: () => void
  onSuccess?: () => void
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export default function EditProfileModal({ visible, onClose, onSuccess }: EditProfileModalProps) {
  const { theme } = useTheme()
  const { user: clerkUser } = useUser()
  const updateProfileMutation = useUpdateProfile()
  
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Animation values
  const backdropOpacity = useSharedValue(0)
  const modalScale = useSharedValue(0.9)

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withSpring(1)
      modalScale.value = withSpring(1)
      
      // Pre-fill with current user data
      if (clerkUser) {
        setName(clerkUser.fullName || clerkUser.firstName || '')
      }
    } else {
      backdropOpacity.value = withSpring(0)
      modalScale.value = withSpring(0.9)
    }
  }, [visible, backdropOpacity, modalScale, clerkUser])

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
  }))

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Update Clerk user profile
      if (clerkUser) {
        await clerkUser.update({
          firstName: name.trim(),
        })
      }

      // Update app profile if bio is supported
      if (bio.trim()) {
        await updateProfileMutation.mutateAsync({
          name: name.trim(),
          bio: bio.trim(),
        })
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Alert.alert('Success', 'Your profile has been updated!', [
        {
          text: 'OK',
          onPress: () => {
            onSuccess?.()
            onClose()
          },
        },
      ])
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    Keyboard.dismiss()
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <BlurView 
            intensity={100} 
            tint={theme.isDark ? 'dark' : 'light'} 
            style={StyleSheet.absoluteFillObject} 
          />
        </Animated.View>
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <Animated.View
              entering={SlideInDown.springify()}
              exiting={SlideOutDown.springify()}
              style={[styles.modal, modalStyle]}
            >
              <View
                style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
              >

                {/* Header */}
                <View style={styles.header}>
                  <Text style={[styles.title, { color: theme.colors.text }]}>
                    Edit Profile
                  </Text>
                  
                  <Pressable
                    onPress={handleClose}
                    style={({ pressed }) => [
                      styles.closeButton,
                      { 
                        opacity: pressed ? 0.7 : 1,
                        backgroundColor: `${theme.colors.surface}CC`,
                      },
                    ]}
                  >
                    <Ionicons name="close" size={24} color={theme.colors.text} />
                  </Pressable>
                </View>

                <ScrollView 
                  style={styles.scrollView}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Name Input */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                      Name
                    </Text>
                    <View style={[styles.inputWrapper, { borderRadius: 16, overflow: 'hidden' }]}>
                      <LinearGradient
                        colors={[`${theme.colors.primary}10`, `${theme.colors.primary}05`]}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <TextInput
                        style={[
                          styles.input,
                          {
                            color: theme.colors.text,
                            backgroundColor: 'transparent',
                          },
                        ]}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                        placeholderTextColor={theme.colors.textMuted}
                        autoCapitalize="words"
                        returnKeyType="next"
                      />
                    </View>
                  </View>

                  {/* Bio Input */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                      Bio
                    </Text>
                    <View style={[styles.inputWrapper, { borderRadius: 16, overflow: 'hidden' }]}>
                      <LinearGradient
                        colors={[`${theme.colors.secondary}10`, `${theme.colors.secondary}05`]}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <TextInput
                        style={[
                          styles.input,
                          styles.bioInput,
                          {
                            color: theme.colors.text,
                            backgroundColor: 'transparent',
                          },
                        ]}
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Tell us about yourself..."
                        placeholderTextColor={theme.colors.textMuted}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        returnKeyType="done"
                      />
                    </View>
                  </View>

                  {/* Info Text */}
                  <View style={styles.infoContainer}>
                    <Ionicons 
                      name="information-circle" 
                      size={16} 
                      color={theme.colors.textMuted} 
                    />
                    <Text style={[styles.infoText, { color: theme.colors.textMuted }]}>
                      Your email and other account settings can be managed through Clerk
                    </Text>
                  </View>
                </ScrollView>

                {/* Actions */}
                <View style={styles.actions}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={handleClose}
                    disabled={isSubmitting}
                    style={styles.button}
                  />
                  
                  <Button
                    title={isSubmitting ? 'Updating...' : 'Save Changes'}
                    variant="primary"
                    onPress={handleSubmit}
                    disabled={isSubmitting || !name.trim()}
                    style={styles.button}
                    leftIcon={
                      isSubmitting ? (
                        <ActivityIndicator size="small" color={theme.colors.textInverse} />
                      ) : undefined
                    }
                  />
                </View>
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  modalContent: {
    padding: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    overflow: 'hidden',
  },
  input: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
  },
  bioInput: {
    minHeight: 100,
    paddingTop: 14,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 4,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
})