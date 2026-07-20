import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Pager } from '../../components/content'

const PATH = '/docs/reference/config'

const CORE_KEYS = [
  { key: 'stone.name', type: 'string', desc: 'The application name. Defaults to "Stone.js".' },
  { key: 'stone.env', type: "'development' | 'production' | ...", desc: 'The environment the app runs in. Defaults to production.' },
  { key: 'stone.debug', type: 'boolean', desc: 'Detailed errors with stack traces. Off by default.' },
  { key: 'stone.locale / fallback_locale', type: 'string', desc: 'Active and fallback locale. Both default to "en".' },
  { key: 'stone.timezone', type: 'string', desc: 'Default timezone. Defaults to "UTC".' },
  { key: 'stone.logger', type: 'object', desc: 'Logger settings, e.g. { level: "info" }.' },
  { key: 'stone.adapters', type: 'array', desc: 'The stacked adapters. Usually set by adapter blueprints, not by hand.' },
  { key: 'stone.kernel.middleware', type: 'array', desc: 'Global middleware every event flows through.' },
  { key: 'stone.kernel.errorHandlers', type: 'object', desc: 'Maps error types to responses, kernel-wide.' },
  { key: 'stone.providers', type: 'array', desc: 'Service providers loaded into the container.' },
  { key: 'stone.services / listeners / subscribers', type: 'array', desc: 'Modules auto-registered at startup.' },
  { key: 'stone.aliases', type: 'object', desc: 'Class aliases registered when the app starts.' },
  { key: 'stone.router', type: 'object', desc: 'Router options (base path, strict matching); from @stone-js/router.' }
]

const BUILD_KEYS = [
  { key: 'stone.builder.rendering', type: "'csr' | 'ssr' | 'ssg'", desc: 'The frontend rendering strategy. The --ssg flag forces ssg for one run.' },
  { key: 'stone.builder.input.mainCSS', type: 'string', desc: 'Entry stylesheet, auto-linked. Defaults to /assets/css/index.css.' },
  { key: 'stone.builder.output', type: 'string', desc: 'The build output directory.' },
  { key: 'stone.builder.ssg', type: 'object', desc: 'Static generation options (the routes to prerender).' },
  { key: 'stone.builder.dotenv', type: 'object', desc: 'How .env files are loaded into the build.' },
  { key: 'stone.builder.excludedModules', type: 'string[]', desc: 'Modules to keep out of the browser bundle.' },
  { key: 'stone.builder.vite / rollup', type: 'object', desc: 'Escape hatches: raw Vite (frontend) or Rollup (backend) config.' }
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

        <H2>Core keys</H2>
        <div className='table-wrap'>
          <table>
            <thead><tr><th>Key</th><th>Type</th><th>Purpose</th></tr></thead>
            <tbody>
              {CORE_KEYS.map((k) => <tr key={k.key}><td>{k.key}</td><td>{k.type}</td><td>{k.desc}</td></tr>)}
            </tbody>
          </table>
        </div>
        <p>
          Note the nesting: global middleware is <code>stone.kernel.middleware</code>, not
          <code> stone.middleware</code>. The kernel sub-tree holds everything the core applies per
          event; the top level holds what the app is.
        </p>

        <H2>Build keys</H2>
        <p>
          The build namespace lives under <code>stone.builder.*</code> and is read by the CLI, not the
          kernel. It is the one place where a value shapes the artifact rather than the running app.
        </p>
        <div className='table-wrap'>
          <table>
            <thead><tr><th>Key</th><th>Type</th><th>Purpose</th></tr></thead>
            <tbody>
              {BUILD_KEYS.map((k) => <tr key={k.key}><td>{k.key}</td><td>{k.type}</td><td>{k.desc}</td></tr>)}
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
