import { SymbolView, type SymbolViewProps, type SymbolWeight } from 'expo-symbols'
import { type StyleProp, type ViewStyle } from 'react-native'

interface IconSymbolProps {
  name: SymbolViewProps['name']
  size?: number
  color: string
  style?: StyleProp<ViewStyle>
  weight?: SymbolWeight
}

export function IconSymbol(props: IconSymbolProps) {
  const size = props.size ?? 24
  return (
    <SymbolView
      weight={props.weight ?? 'regular'}
      tintColor={props.color}
      resizeMode="scaleAspectFit"
      name={props.name}
      style={[{ width: size, height: size }, props.style]}
    />
  )
}
