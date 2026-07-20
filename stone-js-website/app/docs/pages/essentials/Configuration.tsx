import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/essentials/configuration'

const DECL = `
import { StoneApp } from '@stone-js/core'

@StoneApp({
  name: 'tasks',
  // Your own namespace under stone.* is yours to use.
  tasks: { pageSize: 20, allowGuests: false }
})
export class Application {}
`

const IMP = `
import { defineStoneApp } from '@stone-js/core'

export const appConfig = {
  stone: { name: 'tasks', tasks: { pageSize: 20, allowGuests: false } }
}

export const App = defineStoneApp(appConfig, [/* blueprints */])
`

/**
 * Essentials: configuration.
 */
@Page(PATH, { layout: 'docs' })
export class Configuration implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Configuration',
      description: 'Set and read application configuration on the Blueprint, addressed by dotted stone.* keys, resolved once and read-only at runtime.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Essentials' title='Configuration' />
        <Lead>
          Configuration lives on one manifest, the Blueprint, addressed by dotted <code>stone.*</code>
          keys. It is assembled once before the first event and then frozen, so behaviour depends on
          what the manifest says, never on when a value happened to be set.
        </Lead>

        <H2>Setting configuration</H2>
        <p>
          Pass options to <code>@StoneApp</code> (or into <code>defineStoneApp</code>). Keep your own
          settings under an app namespace so they never collide with framework or module keys.
        </p>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H2>Reading configuration</H2>
        <p>
          The config store is injected like any service and read by the same dotted keys, always with
          a default so a missing key never surprises you.
        </p>
        <Code file='app/Tasks.ts'>{`constructor ({ config }) {
  this.pageSize = config.get('stone.tasks.pageSize', 20)
  this.allowGuests = config.get<boolean>('stone.tasks.allowGuests', false)
}`}</Code>

        <H3>Environment-driven config</H3>
        <p>
          Values that differ per deployment come from the environment, read through typed getters and
          folded into the manifest, so the domain never reads <code>process.env</code> directly.
        </p>
        <Code file='app/config.ts'>{`import { getNumber } from '@stone-js/env'

export const appConfig = {
  stone: { tasks: { pageSize: getNumber('PAGE_SIZE', 20) } }
}`}</Code>

        <Callout kind='note' title='Config is read-only at runtime'>
          The manifest is frozen after the build phase. Nothing rewrites it mid-flight, which is what
          makes configuration a fact rather than a moving target. To change behaviour per deployment,
          hand the app a different manifest, not mutable state.
        </Callout>

        <SeeAlso links={[
          { title: 'Environment', path: '/docs/essentials/environment' },
          { title: 'Blueprint: config as a manifest', path: '/docs/foundations/blueprint' },
          { title: 'Configuration reference', path: '/docs/reference/config' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
