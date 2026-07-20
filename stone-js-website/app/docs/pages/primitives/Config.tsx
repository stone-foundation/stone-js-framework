import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/primitives/config'

/**
 * Primitives: config.
 */
@Page(PATH, { layout: 'docs' })
export class Config implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Config',
      description: '@stone-js/config: a deep, dotted-key store. It backs the Blueprint, and works standalone for any nested configuration.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Primitives' title='Config' />
        <Lead>
          <code>@stone-js/config</code> is a deep store addressed by dotted keys. It is what the
          Blueprint is built on, and it stands alone for any nested configuration you want to read and
          write by path, with sensible defaults and deep merging.
        </Lead>

        <H2>Standalone use</H2>
        <Code file='example.ts'>{`import { Config } from '@stone-js/config'

const config = Config.create({ tasks: { pageSize: 20 }, logger: { level: 'info' } })

config.get('tasks.pageSize', 50)   // 20
config.get('tasks.sort', 'asc')    // 'asc' (default; key absent)
config.has('logger.level')         // true
config.set('tasks.pageSize', 100)  // update by path`}</Code>

        <H2>The surface</H2>
        <PropsTable nameHeader='Member' rows={[
          { name: 'Config.create(obj)', type: '(obj) => Config', desc: 'Create a store from an object.' },
          { name: 'get(key, default?)', type: '<T>(key, T?) => T', desc: 'Read by dotted key, with a fallback.' },
          { name: 'set(key, value)', type: '(key, value) => this', desc: 'Write by dotted key.' },
          { name: 'has(key)', type: '(key) => boolean', desc: 'Test presence by dotted key.' },
          { name: 'all()', type: '() => object', desc: 'The whole store.' },
          { name: 'clear()', type: '() => this', desc: 'Empty the store.' }
        ]} />

        <H2>The path helpers</H2>
        <p>
          The same dotted-path logic is exposed as standalone functions, useful for reading or merging
          plain objects without a <code>Config</code> instance.
        </p>
        <Code file='example.ts'>{`import { getPath, setPath, hasPath, deepMerge } from '@stone-js/config'

getPath(obj, 'a.b.c', fallback)
setPath(obj, 'a.b.c', value)
hasPath(obj, 'a.b.c')
deepMerge(defaults, overrides)`}</Code>

        <Callout kind='note' title='This is the Blueprint underneath'>
          When you call <code>blueprint.get('stone.tasks.pageSize', 20)</code>, this is the store
          answering. Learning it here is learning how the manifest is read everywhere.
        </Callout>

        <SeeAlso links={[
          { title: 'The Blueprint', path: '/docs/blueprint' },
          { title: 'Configuration', path: '/docs/essentials/configuration' },
          { title: 'Configuration reference', path: '/docs/reference/config' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
