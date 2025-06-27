import React, {Component,  type ComponentType, type PropsWithChildren, type ErrorInfo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Button } from './ui'

interface Props extends PropsWithChildren {
  fallback?: ComponentType<{ error: Error; resetError: () => void }>
}

interface State {
  hasError: boolean
  error: Error | null
}

function DefaultErrorFallback(props: { error: Error; resetError: () => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🚫 Something went wrong</Text>
        <Text style={styles.message}>
          We encountered an unexpected error. Please try again.
        </Text>
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            <Text style={styles.debugText}>{props.error.message}</Text>
          </View>
        )}
        <Button
          title="Try Again"
          onPress={props.resetError}
          variant="primary"
          style={styles.button}
        />
      </View>
    </View>
  )
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    } else {
      // Production error handling - log to console and could integrate with crash reporting
      console.error('Production Error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      })
      
      // In a real app, you would send this to a crash reporting service like:
      // - Sentry: Sentry.captureException(error, { contexts: { react: errorInfo } })
      // - Bugsnag: Bugsnag.notify(error, { metadata: { react: errorInfo } })
      // - Firebase Crashlytics: crashlytics().recordError(error)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  content: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  debugContainer: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  button: {
    width: '100%',
  },
})

export default ErrorBoundary
