import { JSX } from 'react'
import { PortalMark } from './PortalMark'
import { useStoneTheme } from './theme'
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native'

const DOCS = 'https://stonejs.dev/docs'
const GITHUB = 'https://github.com/stone-foundation/stone-js-framework'

/**
 * The welcome screen.
 *
 * The native twin of the web starters' welcome page: the same mark, the same palette, the same
 * words. What differs is only what a phone does differently, which is the whole point of the
 * framework: `View` instead of `div`, a `StyleSheet` instead of a stylesheet, `Linking` instead of
 * an anchor, and a glow drawn as a circle because there is no `radial-gradient`.
 *
 * @param props.message - What the handler returned.
 * @returns The screen.
 */
export function WelcomeView ({ message }: { message?: string }): JSX.Element {
  const theme = useStoneTheme()

  const open = (url: string): void => { void Linking.openURL(url) }

  return (
    <View style={[styles.screen, { backgroundColor: theme.ink }]}>
      <View style={[styles.glow, { backgroundColor: theme.inkGlow }]} pointerEvents='none' />

      <View style={styles.hero}>
        <PortalMark size={104} />

        <Text style={[styles.eyebrow, { color: theme.creamDim }]}>WELCOME TO</Text>
        <Text style={[styles.title, { color: theme.ember2 }]}>Stone.js</Text>
        <Text style={[styles.lead, { color: theme.cream }]}>{message}</Text>
        <Text style={[styles.tagline, { color: theme.creamDim }]}>
          Your app is running. Write your domain once, Stone.js is the context that runs it
          anywhere: server, serverless, browser, CLI and the edge.
        </Text>

        <View style={styles.links}>
          <Pressable
            accessibilityRole='link'
            onPress={() => open(DOCS)}
            style={[styles.pill, { borderColor: theme.line, backgroundColor: theme.card }]}
          >
            <Text style={[styles.pillText, { color: theme.cream }]}>Documentation</Text>
          </Pressable>
          <Pressable
            accessibilityRole='link'
            onPress={() => open(GITHUB)}
            style={[styles.pill, { borderColor: theme.line, backgroundColor: theme.card }]}
          >
            <Text style={[styles.pillText, { color: theme.cream }]}>GitHub</Text>
          </Pressable>
        </View>

        <Text style={[styles.edit, { color: theme.creamDim }]}>
          Edit <Text style={[styles.editFile, { color: theme.ember1 }]}>app/HomeScreen.tsx</Text>
        </Text>
      </View>

      <Text style={[styles.brand, { color: theme.creamDim }]}>
        <Text style={{ color: theme.ember2 }}>●</Text> Stone.js · the continuum framework
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
    overflow: 'hidden'
  },
  // The web starter's ember glow, as the only shape a phone can draw it with.
  glow: {
    position: 'absolute',
    top: '4%',
    width: 420,
    height: 420,
    borderRadius: 210,
    opacity: 0.55
  },
  hero: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center'
  },
  eyebrow: {
    marginTop: 22,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 3.4
  },
  title: {
    marginTop: 6,
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -1.6
  },
  lead: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center'
  },
  tagline: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center'
  },
  links: {
    marginTop: 30,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12
  },
  pill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 18
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600'
  },
  edit: {
    marginTop: 18,
    fontSize: 13,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' })
  },
  editFile: {
    fontWeight: '700'
  },
  brand: {
    position: 'absolute',
    bottom: 32,
    fontSize: 13
  }
})
