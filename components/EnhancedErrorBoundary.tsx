import { useTheme } from '@/contexts/ThemeContext'
import { Ionicons } from '@expo/vector-icons'
import * as Linking from 'expo-linking'
import React, { type ErrorInfo, type ReactNode } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInUp, SlideInDown } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Card } from './ui'
// Note: Install expo-mail-composer if you want to use email functionality
// import * as MailComposer from 'expo-mail-composer'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  retryCount: number
}

export class EnhancedErrorBoundary extends React.Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Call custom error handler
    this.props.onError?.(error, errorInfo)

    // In production, you might want to send to crash reporting service
    if (__DEV__) {
      console.error('Component Stack:', errorInfo.componentStack)
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: this.state.retryCount + 1,
      })
    } else {
      Alert.alert(
        'Maximum Retries Reached',
        'The app has failed to recover after multiple attempts. Please restart the app.',
        [{ text: 'OK' }],
      )
    }
  }

  handleSendReport = async () => {
    try {
      const errorMessage = `
Error: ${this.state.error?.message || 'Unknown error'}
Stack: ${this.state.error?.stack || 'No stack trace'}
Component Stack: ${this.state.errorInfo?.componentStack || 'No component stack'}
Retry Count: ${this.state.retryCount}
Timestamp: ${new Date().toISOString()}
`

      // For now, use mailto fallback (install expo-mail-composer for better UX)
      const mailto = `mailto:support@emuready.app?subject=EmuReady Mobile App Error Report&body=${encodeURIComponent(errorMessage)}`
      await Linking.openURL(mailto)
    } catch {
      Alert.alert(
        'Cannot Send Report',
        'Unable to send error report. Please contact support at support@emuready.app',
        [{ text: 'OK' }],
      )
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <ErrorFallback
          error={this.state.error}
          retryCount={this.state.retryCount}
          maxRetries={this.maxRetries}
          onRetry={this.handleRetry}
          onSendReport={this.handleSendReport}
        />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
  retryCount: number
  maxRetries: number
  onRetry: () => void
  onSendReport: () => void
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  retryCount,
  maxRetries,
  onRetry,
  onSendReport,
}) => {
  const { theme } = useTheme()
  const styles = createStyles(theme)

  const canRetry = retryCount < maxRetries

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.iconContainer}>
          <Ionicons name="alert-circle-outline" size={80} color={theme.colors.error} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.textContainer}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>
            The app encountered an unexpected error and needs to recover.
          </Text>

          {__DEV__ && error && (
            <Card variant="outline" padding="sm" style={styles.errorCard}>
              <Text style={styles.errorTitle}>Debug Information:</Text>
              <Text style={styles.errorText} numberOfLines={5}>
                {error.message}
              </Text>
            </Card>
          )}
        </Animated.View>

        <Animated.View entering={SlideInDown.delay(300).springify()} style={styles.actionContainer}>
          {canRetry ? (
            <Button
              title={`Try Again ${retryCount > 0 ? `(${retryCount}/${maxRetries})` : ''}`}
              onPress={onRetry}
              variant="primary"
              style={styles.primaryButton}
              leftIcon={<Ionicons name="refresh" size={16} color="#ffffff" />}
            />
          ) : (
            <Text style={styles.maxRetriesText}>
              Maximum retry attempts reached. Please restart the app.
            </Text>
          )}

          <Button
            title="Send Error Report"
            onPress={onSendReport}
            variant="outline"
            style={styles.secondaryButton}
            leftIcon={<Ionicons name="mail-outline" size={16} color={theme.colors.primary} />}
          />

          <Pressable
            style={styles.helpButton}
            onPress={() => Linking.openURL('https://emuready.app/help')}
          >
            <Text style={styles.helpText}>Need help? Visit our support page</Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    iconContainer: {
      marginBottom: 24,
    },
    textContainer: {
      alignItems: 'center',
      marginBottom: 32,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 16,
    },
    errorCard: {
      marginTop: 16,
      maxWidth: '100%',
    },
    errorTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.error,
      marginBottom: 8,
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.textMuted,
      fontFamily: 'monospace',
    },
    actionContainer: {
      width: '100%',
      gap: 12,
    },
    primaryButton: {
      width: '100%',
    },
    secondaryButton: {
      width: '100%',
    },
    maxRetriesText: {
      fontSize: 14,
      color: theme.colors.warning,
      textAlign: 'center',
      marginBottom: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.warningLight,
      borderRadius: 8,
    },
    helpButton: {
      paddingVertical: 12,
      alignItems: 'center',
    },
    helpText: {
      fontSize: 14,
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
  })

export default EnhancedErrorBoundary
