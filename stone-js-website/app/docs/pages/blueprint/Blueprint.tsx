import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/blueprint'

/**
 * Blueprint & build: the Blueprint (implementation).
 */
@Page(PATH, { layout: 'docs' })
export class Blueprint implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'The Blueprint',
      description: 'The single, immutable manifest of the application: how it is addressed, read and written, and why it is frozen before the first event.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Blueprint & build' title='The Blueprint' />
        <Lead>
          The Blueprint is the whole application described as data: adapters, providers, middleware,
          routes and your own config, all under dotted <code>stone.*</code> keys. It is assembled once
          before the first event and then frozen, so the framework only ever reads a settled manifest.
        </Lead>

        <H2>A keyed store</H2>
        <p>
          The Blueprint behaves like a deep, dotted-key store. Reads take a key and a default; writes
          set a key. During the build phase it is mutable; after, it is read-only.
        </p>
        <Code file='app/steps.ts'>{`blueprint.get('stone.name')                       // read
blueprint.get('stone.tasks.pageSize', 20)         // read with a default
blueprint.has('stone.router')                      // presence
blueprint.set('stone.tasks.pageSize', 50)          // write (build phase only)`}</Code>

        <H2>The Blueprint API</H2>
        <PropsTable nameHeader='Method' rows={[
          { name: 'get(key, default?)', type: '<T>(key, T?) => T', desc: 'Read a value by dotted key, with an optional fallback.' },
          { name: 'set(key, value)', type: '(key, value) => this', desc: 'Write a value (during the build phase).' },
          { name: 'has(key)', type: '(key) => boolean', desc: 'Whether a key is present.' },
          { name: 'add(key, value)', type: '(key, value) => this', desc: 'Append to an array-valued key (e.g. adapters, middleware).' }
        ]} />

        <H3>Well-known keys</H3>
        <p>
          Framework and modules own sub-trees under <code>stone.*</code>; you own your app's namespace.
          The full list lives in the configuration reference; the common ones:
        </p>
        <PropsTable rows={[
          { name: 'stone.name', type: 'string', desc: 'The application name.' },
          { name: 'stone.adapters', type: 'array', desc: 'The stacked adapters (usually written by adapter blueprints).' },
          { name: 'stone.providers', type: 'array', desc: 'Registered service providers.' },
          { name: 'stone.middleware', type: 'array', desc: 'Global middleware.' },
          { name: 'stone.router', type: 'object', desc: 'Router configuration.' }
        ]} />

        <Callout kind='note' title='Immutable on purpose'>
          Freezing the Blueprint after the build phase is what makes configuration a fact instead of a
          moving target. To vary behaviour per deployment, hand the app a different manifest, do not
          mutate one at runtime.
        </Callout>

        <SeeAlso links={[
          { title: 'Blueprint: config as a manifest (concept)', path: '/docs/foundations/blueprint' },
          { title: 'Blueprint middleware', path: '/docs/blueprint/middleware' },
          { title: 'Configuration reference', path: '/docs/reference/config' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
