import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Pager } from '../../components/content'

const PATH = '/docs/reference/config'

const KEYS = [
  { key: 'stone.name', type: 'string', desc: 'The application name.' },
  { key: 'stone.logger', type: 'object', desc: 'Logger settings, e.g. { level: "info" }.' },
  { key: 'stone.adapters', type: 'array', desc: 'The stacked adapters. Usually set by adapter blueprints, not by hand.' },
  { key: 'stone.middleware', type: 'array', desc: 'Global middleware applied to every event.' },
  { key: 'stone.providers', type: 'array', desc: 'Service providers registered into the container.' },
  { key: 'stone.router', type: 'object', desc: 'Router options (base path, strict matching).' },
  { key: 'stone.builder.input.mainCSS', type: 'string', desc: 'Entry stylesheet, auto-linked. Defaults to /assets/css/index.css.' },
  { key: 'stone.rendering', type: "'csr' | 'ssr' | 'ssg'", desc: 'The frontend rendering strategy.' }
]

/**
 * Reference: configuration keys.
 */
@Page(PATH, { layout: 'docs' })
export class Configuration implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Configuration reference',
      description: 'The Blueprint, addressed by dotted stone.* keys: the common keys and where they come from.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Reference' title='Configuration reference' />
        <Lead>
          All configuration lives on one Blueprint, addressed by dotted <code>stone.*</code> keys.
          You rarely set most of them directly: decorators and blueprints write them for you. This
          is the map of what ends up there.
        </Lead>

        <H2>Where keys come from</H2>
        <p>
          Three sources feed the Blueprint, resolved once at startup: your decorators (introspected
          into keys), imperative <code>define*</code> meta-modules, and the config passed to
          <code> @StoneApp</code> / <code>defineStoneApp</code>. Later sources refine earlier ones;
          the result is frozen before the first event.
        </p>

        <H2>Common keys</H2>
        <div className='table-wrap'>
          <table>
            <thead><tr><th>Key</th><th>Type</th><th>Purpose</th></tr></thead>
            <tbody>
              {KEYS.map((k) => <tr key={k.key}><td>{k.key}</td><td>{k.type}</td><td>{k.desc}</td></tr>)}
            </tbody>
          </table>
        </div>

        <H2>Reading and setting</H2>
        <Code file='app/example.ts'>{`// read, with a default
const level = config.get('stone.logger.level', 'info')

// set, imperatively, in a meta-module
export const appConfig = { stone: { name: 'tasks', logger: { level: 'debug' } } }`}</Code>

        <Callout kind='note' title='Adapters and extensions extend the namespace'>
          Every adapter and extension owns its own sub-tree under <code>stone.*</code> (for example
          the validation, auth or router keys). Their pages document those keys; this reference
          covers the core and the shared build keys.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
