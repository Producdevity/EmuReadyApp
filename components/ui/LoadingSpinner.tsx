import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'

interface LoadingSpinnerProps {
  size?: 'small' | 'large'
  text?: string
  color?: string
}

export function LoadingSpinner(props: LoadingSpinnerProps) {
  const color = props.color ?? '#3b82f6'
  return (
    <View style={styles.container}>
      <ActivityIndicator size={props.size ?? 'small'} color={color} />
      {props.text && <Text style={[styles.text, { color }]}>{props.text}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
})
