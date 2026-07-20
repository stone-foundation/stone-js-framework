import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/essentials/environment'

/**
 * Essentials: environment.
 */
@Page(PATH, { layout: 'docs' })
export class Environment implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Environment',
      description: 'Read the environment through typed, validated getters, so a bad value fails loudly at the edge instead of surfacing as a mystery later.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Essentials' title='Environment' />
        <Lead>
          The environment is the least trustworthy input an app has: strings, possibly missing,
          possibly malformed. <code>@stone-js/env</code> reads it through typed getters that parse and
          validate, turning a whole class of runtime mysteries into a loud failure at startup.
        </Lead>

        <H2>Typed getters</H2>
        <Principle
          principle={
            <p>
              Reading <code>process.env.X</code> gives you a string or <code>undefined</code>, and
              every caller re-implements parsing and validation. Centralise it: read each value once,
              typed and checked, and fail immediately when it is wrong.
            </p>
          }
          incarnation={
            <p>
              Each getter parses to a type and validates. A required value that is absent or malformed
              throws an <code>EnvError</code> at read time, so misconfiguration is caught at the edge,
              not deep in a handler.
            </p>
          }
        />
        <Code file='app/config.ts'>{`import { getString, getNumber, getBoolean, getUrl, getEnum } from '@stone-js/env'

const dbUrl   = getUrl('DATABASE_URL')                 // throws if absent or not a URL
const pageSize = getNumber('PAGE_SIZE', 20)            // parsed, with a default
const debug   = getBoolean('DEBUG', false)
const region  = getString('REGION', 'eu-west-3')
const tier    = getEnum('TIER', ['free', 'pro'], 'free')`}</Code>

        <H2>The getters</H2>
        <PropsTable nameHeader='Getter' rows={[
          { name: 'getString(key, default?)', type: 'string', desc: 'A required or defaulted string.' },
          { name: 'getNumber(key, default?)', type: 'number', desc: 'Parsed and checked as a number.' },
          { name: 'getBoolean(key, default?)', type: 'boolean', desc: 'Parses true/false/1/0.' },
          { name: 'getUrl(key, default?)', type: 'URL', desc: 'Validates a URL.' },
          { name: 'getEnum(key, values, default?)', type: 'union', desc: 'Restricts to a set of allowed values.' },
          { name: 'getJson(key, default?)', type: 'object', desc: 'Parses a JSON value.' },
          { name: 'getArray / getEmail / getHost / getObject', type: 'various', desc: 'Further typed getters for common shapes.' }
        ]} />

        <Callout kind='note' title='Read at the edge, inject inward'>
          Read the environment in config or a provider, then feed the results into the Blueprint and
          inject them. Handlers and services should receive resolved values, never read
          <code> process.env</code> themselves, so they stay portable across platforms.
        </Callout>

        <SeeAlso links={[
          { title: 'Configuration', path: '/docs/essentials/configuration' },
          { title: 'Service providers', path: '/docs/foundations/providers' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
