import { JSX, useState } from 'react'
import { Reveal } from '../components/ui/Reveal'

interface Target {
  key: string
  label: string
  dec: string
  decImport: string
  bp: string
  pkg: string
  kind: 'server' | 'front' | 'agent'
}

/** Real adapters, real decorators, real blueprints. No default flag: the collapse is deferred to runtime. */
const TARGETS: Target[] = [
  { key: 'node', label: 'node-http', dec: '@NodeHttp()', decImport: 'NodeHttp', bp: 'nodeHttpAdapterBlueprint', pkg: '@stone-js/node-http-adapter', kind: 'server' },
  { key: 'lambda', label: 'aws-lambda', dec: '@AwsLambdaHttp()', decImport: 'AwsLambdaHttp', bp: 'awsLambdaHttpAdapterBlueprint', pkg: '@stone-js/aws-lambda-http-adapter', kind: 'server' },
  { key: 'edge', label: 'cloudflare·edge', dec: '@Fetch()', decImport: 'Fetch', bp: 'fetchAdapterBlueprint', pkg: '@stone-js/fetch-adapter', kind: 'server' },
  { key: 'browser', label: 'browser', dec: '@Browser()', decImport: 'Browser', bp: 'browserAdapterBlueprint', pkg: '@stone-js/browser-adapter', kind: 'front' },
  { key: 'mcp', label: 'mcp·dev', dec: '@McpDev()', decImport: 'McpDev', bp: 'mcpDevBlueprint', pkg: '@stone-js/mcp-dev', kind: 'agent' }
]

/** Reads the superposed state as an application shape. */
function stateLabel (selected: Target[]): JSX.Element {
  const hasFront = selected.some((t) => t.kind === 'front')
  const hasServer = selected.some((t) => t.kind === 'server')
  const hasAgent = selected.some((t) => t.kind === 'agent')

  let shape: string
  if (selected.length === 0) shape = '|domain⟩ · pure, no context yet'
  else if (hasFront && hasServer) shape = '|SSR⟩ · universal app'
  else if (hasFront) shape = '|SPA⟩ · browser app'
  else if (hasServer) shape = '|API⟩ · service'
  else shape = '|tools⟩ · agent service'

  const agents = hasAgent && (hasFront || hasServer) ? ' + agents' : ''
  return <>state: <b>{shape}{agents}</b> · collapse deferred to runtime</>
}

/**
 * Superposition, in real code: stack several adapters at once. The contextual
 * collapse happens at runtime, not when you pick an adapter.
 */
export function CollapseLab (): JSX.Element {
  const [keys, setKeys] = useState<string[]>(['node', 'lambda'])
  const [paradigm, setParadigm] = useState<'decl' | 'imp'>('decl')

  const selected = TARGETS.filter((t) => keys.includes(t.key))
  const toggle = (key: string): void => {
    setKeys((current) => current.includes(key) ? current.filter((k) => k !== key) : [...current, key])
  }
  const pickParadigm = (p: 'decl' | 'imp'): void => {
    setParadigm(p)
    try { sessionStorage.setItem('stone-paradigm', p) } catch {}
  }

  // A key that changes with the selection re-mounts the <pre>, replaying the flash animation.
  const stamp = keys.join('+')

  return (
    <section id='collapse'>
      <div className='wrap'>
        <Reveal className='sec-head center'>
          <p className='eyebrow'><span className='psi'>ψ</span>Superposition, in code</p>
          <h2>Stack adapters. Collapse at runtime.</h2>
          <p>
            There is no build-time choice to regret. Install as many adapters as you want:
            they superpose in your code, visibly. Work locally on Node, ship the same class
            to a Lambda. The contextual collapse happens at runtime, in the integration
            dimension. Toggle contexts:
          </p>
        </Reveal>
        <Reveal className='collapse-lab'>
          <div className='targets-row' role='group' aria-label='Superpose contexts'>
            {TARGETS.map((t) => (
              <button
                key={t.key}
                className='tchip'
                aria-pressed={keys.includes(t.key)}
                onClick={() => toggle(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className='state-line'>{stateLabel(selected)}</p>
          <div className='code'>
            <div className='para-tabs' role='tablist'>
              <button className='para-tab' role='tab' aria-selected={paradigm === 'decl'} onClick={() => pickParadigm('decl')}>|declarative⟩</button>
              <button className='para-tab' role='tab' aria-selected={paradigm === 'imp'} onClick={() => pickParadigm('imp')}>|imperative⟩</button>
            </div>
            {paradigm === 'decl'
              ? (
                <pre key={`d-${stamp}`}>
                  {selected.length === 0 && <span className='cm'>{'// no adapter yet: the domain awaits observation\n'}</span>}
                  {selected.map((t) => (
                    <span key={t.key}><span className='kw'>import</span> {'{ '}<span className='ch fn'>{t.decImport}</span>{' }'} <span className='kw'>from</span> <span className='st'>'{t.pkg}'</span>{'\n'}</span>
                  ))}
                  {'\n'}
                  {selected.map((t) => (
                    <span key={t.key}><span className='ch kw'>{t.dec}</span>{'\n'}</span>
                  ))}
                  <span className='kw'>@Routing</span>(){'\n'}
                  <span className='kw'>@StoneApp</span>(){'\n'}
                  <span className='kw'>export class</span> <span className='fn'>Application</span> {'{}'}
                </pre>
                )
              : (
                <pre key={`i-${stamp}`}>
                  {selected.length === 0 && <span className='cm'>{'// no adapter yet: the domain awaits observation\n'}</span>}
                  {selected.map((t) => (
                    <span key={t.key}><span className='kw'>import</span> {'{ '}<span className='ch fn'>{t.bp}</span>{' }'} <span className='kw'>from</span> <span className='st'>'{t.pkg}'</span>{'\n'}</span>
                  ))}
                  {'\n'}
                  <span className='kw'>export const</span> App = <span className='fn'>defineStoneApp</span>({'\n'}
                  {'  '}{'{ name: '}<span className='st'>'app'</span>{' },\n'}
                  {'  '}[routerBlueprint{selected.map((t) => (
                    <span key={t.key}>, <span className='ch fn'>{t.bp}</span></span>
                  ))}]{'\n'}
                  )
                </pre>
                )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
