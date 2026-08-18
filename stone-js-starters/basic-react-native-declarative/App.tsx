import { stoneApp } from '@stone-js/core'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { Application } from './app/Application'
import { WelcomeData, WelcomeController } from './app/WelcomeController'
import { nativeEventSource } from './adapter/NativeEventSource'
import { onNativeError, onNativeRender } from './adapter/renderSink'
import { nativeAdapterBlueprint } from './adapter/nativeAdapterBlueprint'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

/**
 * One platform self-check, shown as a green or red row on screen.
 */
interface PlatformCheck {
  label: string
  passed: boolean
  detail: string
}

/**
 * A minimal stage-3 decorator writing into `context.metadata`: if Babel emits
 * the 2023-11 semantics correctly under Metro/Hermes, the value is readable
 * back through `Symbol.metadata` (or its `Symbol.for` fallback, the one
 * Stone.js core uses).
 */
const probe: any = (_value: unknown, context: { metadata: Record<PropertyKey, unknown> }): undefined => {
  context.metadata.stonePoc = 'ok'
}

@probe
class MetadataProbe {}

/**
 * Run the runtime platform checks Stone.js depends on.
 *
 * @returns The list of checks with their outcome.
 */
function runPlatformChecks (): PlatformCheck[] {
  const checks: PlatformCheck[] = []

  const metadataSymbol: symbol = (Symbol as any).metadata ?? Symbol.for('Symbol.metadata')
  const probeMetadata = (MetadataProbe as any)[metadataSymbol]
  checks.push({
    label: 'Decorators 2023-11 + Symbol.metadata',
    passed: probeMetadata?.stonePoc === 'ok',
    detail: probeMetadata?.stonePoc === 'ok' ? 'context.metadata readable' : 'metadata missing'
  })

  let urlPassed = false
  let urlDetail = 'URL API incomplete'
  try {
    const url = new URL('stone://app/hello/Noowow?from=poc')
    urlPassed = url.pathname === '/hello/Noowow' && url.searchParams.get('from') === 'poc'
    urlDetail = urlPassed ? 'pathname + searchParams OK' : `pathname=${String(url.pathname)}`
  } catch (error: any) {
    urlDetail = String(error?.message ?? error)
  }
  checks.push({ label: 'WHATWG URL (polyfill)', passed: urlPassed, detail: urlDetail })

  const encoderPassed = typeof globalThis.TextEncoder !== 'undefined' &&
    new TextEncoder().encode('stone').byteLength === 5
  checks.push({
    label: 'TextEncoder',
    passed: encoderPassed,
    detail: encoderPassed ? 'available' : 'missing'
  })

  return checks
}

/**
 * The proof-of-concept screen: boots the Stone.js application through the
 * native adapter, shows the platform checks and lets you navigate between
 * routes of the same domain you would deploy on any other platform.
 */
export default function App (): React.JSX.Element {
  const [checks, setChecks] = useState<PlatformCheck[]>([])
  const [payload, setPayload] = useState<WelcomeData>()
  const [error, setError] = useState<string>()
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    setChecks(runPlatformChecks())

    onNativeRender((response) => {
      setError(undefined)
      setBooted(true)
      setPayload(response.content as WelcomeData)
    })

    onNativeError((err) => {
      setError(String(err?.message ?? err))
    })

    stoneApp({ modules: [Application, WelcomeController, nativeAdapterBlueprint] })
      .run()
      .catch((err: Error) => setError(String(err?.message ?? err)))
  }, [])

  const allPassed = checks.every((check) => check.passed) && booted && error === undefined

  return (
    <View style={styles.container}>
      <StatusBar style='light' />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Stone.js × React Native</Text>
        <Text style={styles.subtitle}>Continuum proof of concept</Text>

        <View style={[styles.banner, allPassed ? styles.bannerOk : styles.bannerKo]}>
          <Text style={styles.bannerText}>
            {allPassed ? 'ALL CHECKS GREEN' : (booted ? 'CHECKS FAILING' : 'BOOTING…')}
          </Text>
        </View>

        {checks.map((check) => (
          <View key={check.label} style={styles.checkRow}>
            <Text style={check.passed ? styles.checkOk : styles.checkKo}>
              {check.passed ? '✓' : '✗'} {check.label}
            </Text>
            <Text style={styles.checkDetail}>{check.detail}</Text>
          </View>
        ))}

        <View style={styles.checkRow}>
          <Text style={booted ? styles.checkOk : styles.checkKo}>
            {booted ? '✓' : '…'} Kernel boot + router dispatch
          </Text>
          <Text style={styles.checkDetail}>
            {booted ? `matched ${String(payload?.route)}` : 'waiting for the first render'}
          </Text>
        </View>

        {error !== undefined && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {payload !== undefined && (
          <View style={styles.payloadBox}>
            <Text style={styles.payloadMessage}>{payload.message}</Text>
            <Text style={styles.payloadMeta}>
              {payload.framework.name} · {payload.framework.tagline}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Navigate the same domain</Text>
        <View style={styles.buttons}>
          <NavButton label='Home' url='stone://app/' />
          <NavButton label='Hello Noowow' url='stone://app/hello/Noowow' />
          <NavButton label='Hello Mr. Stone' url='stone://app/hello/Mr.%20Stone' />
          <NavButton label='Unknown route' url='stone://app/nowhere' />
        </View>
      </ScrollView>
    </View>
  )
}

/**
 * A navigation button emitting an intent into the native event source.
 */
function NavButton ({ label, url }: { label: string, url: string }): React.JSX.Element {
  return (
    <Pressable style={styles.button} onPress={() => nativeEventSource.navigate(url)}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141210' },
  content: { padding: 24, paddingTop: 72 },
  title: { color: '#f5f1ea', fontSize: 26, fontWeight: '700' },
  subtitle: { color: '#b8b0a4', fontSize: 14, marginTop: 4, marginBottom: 20 },
  banner: { borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginBottom: 20 },
  bannerOk: { backgroundColor: '#1f5130' },
  bannerKo: { backgroundColor: '#5e2b1e' },
  bannerText: { color: '#f5f1ea', fontWeight: '700', letterSpacing: 1 },
  checkRow: { marginBottom: 12 },
  checkOk: { color: '#7fd39a', fontSize: 15, fontWeight: '600' },
  checkKo: { color: '#e88d70', fontSize: 15, fontWeight: '600' },
  checkDetail: { color: '#8d8578', fontSize: 12, marginLeft: 18, marginTop: 2 },
  errorBox: { backgroundColor: '#3a1f18', borderRadius: 8, padding: 12, marginTop: 8 },
  errorText: { color: '#e88d70', fontSize: 13 },
  payloadBox: { backgroundColor: '#221e1a', borderRadius: 8, padding: 16, marginTop: 16 },
  payloadMessage: { color: '#f5f1ea', fontSize: 16, fontWeight: '600' },
  payloadMeta: { color: '#b8b0a4', fontSize: 12, marginTop: 6 },
  sectionTitle: { color: '#f5f1ea', fontSize: 16, fontWeight: '700', marginTop: 28, marginBottom: 12 },
  buttons: { gap: 10 },
  button: { backgroundColor: '#2e2823', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#f5f1ea', fontSize: 15, fontWeight: '600' }
})
