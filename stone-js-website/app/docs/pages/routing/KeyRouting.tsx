import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/routing/key-routing'

/**
 * Routing: Key routing (light).
 */
@Page(PATH, { layout: 'docs' })
export class KeyRouting implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Key routing (light)',
      description: 'The event-routing sibling of @Routing(): route events by a key, not a path. One kernel handler for bus events, realtime gateways and CLI commands, tree-shaken away when unused.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Routing' title='Key routing (light)' />
        <Lead>
          Not every event has a URL. A cloud bus message, a WebSocket frame, a CLI command are keyed
          by a name, not a path. <code>@KeyRouting()</code> is the event-routing sibling of
          <code> @Routing()</code>: it installs a tiny kernel event handler that routes by a
          <em> key</em> instead of matching a route. Same pattern as the full router
          (<code>adapter → kernel → handler</code>), a fraction of the size, and tree-shaken away when
          you do not use it.
        </Lead>

        <H2>Why a second router</H2>
        <p>
          The universal <code>@Routing()</code> carries paths, parameters, constraints, groups and URL
          generation, everything an HTTP surface needs. An event consumer needs none of that: it maps
          <code> order.shipped</code> to a handler. Forcing the full router onto a queue worker or a
          bus consumer is weight with no benefit. <code>@KeyRouting()</code> is that mapping and
          nothing else, built on the <code>@stone-js/key-router</code> primitive.
        </p>
        <Callout kind='note' title='They are mutually exclusive'>
          Both routers provide <code>stone.kernel.eventHandler</code>, so an application uses one or
          the other. Declaring <code>@Routing()</code> and <code>@KeyRouting()</code> together throws
          at build time. Tree-shaking keeps the full router out of the bundle when only
          <code> @KeyRouting()</code> is present.
        </Callout>

        <H2>Enable it</H2>
        <p>
          Stack it on any adapter that runs the kernel. Each incoming event is routed by a key read
          from a configurable property.
        </p>
        <Code file='app/Application.ts'>{`import { StoneApp } from '@stone-js/core'
import { AwsLambda } from '@stone-js/aws-lambda-adapter'
import { KeyRouting } from '@stone-js/router'

@KeyRouting({ source: 'detail-type' })   // which incoming property carries the key
@AwsLambda()
@StoneApp({ name: 'consumer' })
export class Application {}`}</Code>

        <H3>Handlers</H3>
        <Code file='app/Handlers.ts'>{`import { KeyHandler, OnKey } from '@stone-js/router'

@KeyHandler()
export class Handlers {
  @OnKey('order.shipped')   async onShipped (payload) { /* … */ }
  @OnKey('order.cancelled') async onCancelled (payload) { /* … */ }
}`}</Code>
        <p>Or define routes imperatively:</p>
        <Code file='app/config.ts'>{`import { defineConfig } from '@stone-js/core'
import { defineKeyRouting, defineKeyRoute } from '@stone-js/router'

export const AppConfig = defineConfig(defineKeyRouting({
  source: 'detail-type',
  definitions: [ defineKeyRoute('order.shipped', OnShipped, { isClass: true }) ]
}))`}</Code>

        <H3>The routing key is configurable</H3>
        <p>
          <code>source</code> names the incoming-event property holding the key (defaults to
          <code> detail-type</code>, where cloud buses put the event name). Pass a full
          <code> extractor</code> for any other shape, and <code>strict: true</code> to throw on an
          unmatched key instead of a no-op.
        </p>
        <Code file='app/Application.ts'>{`@KeyRouting({
  extractor: (event) => {
    const raw = event.get('metadata', {})
    return { key: raw.type, payload: raw.data }
  },
  strict: true
})`}</Code>

        <H2>Who uses it</H2>
        <PropsTable nameHeader='caller' rows={[
          { name: '@stone-js/event-bus', type: 'listener', desc: 'Incoming bus events (@OnBusEvent) route through the light router on any cloud adapter.' },
          { name: '@stone-js/realtime', type: 'gateways', desc: 'WebSocket adapters feed socket events to the kernel; @On* gateway methods are keyed handlers.' },
          { name: 'CLI commands', type: 'commands', desc: 'A command name is a key; the console adapter dispatches through the same router.' }
        ]} />

        <SeeAlso links={[
          { title: 'Routing overview', path: '/docs/routing' },
          { title: 'Event Bus', path: '/docs/extensions/event-bus' },
          { title: 'Realtime', path: '/docs/extensions/realtime' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
