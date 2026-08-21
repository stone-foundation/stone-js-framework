import { JSX } from 'react'
import { View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useStoneTheme } from './app/theme'
import { StoneNativeApp } from '@stone-js/use-react-native'

/**
 * The root component.
 *
 * `StoneNativeApp` shows the screen on top of the stack, which is all a first run needs, and it
 * needs nothing installed to do it. When the application grows a real navigator, this is the
 * component it replaces: the stack is public state, so `@react-navigation/native-stack` drives
 * itself from the same object through `useScreens()`. The README shows that wiring.
 *
 * @returns The application.
 */
export default function App (): JSX.Element {
  const theme = useStoneTheme()

  return (
    <View style={{ flex: 1, backgroundColor: theme.ink }}>
      <StatusBar style='auto' />
      <StoneNativeApp />
    </View>
  )
}
