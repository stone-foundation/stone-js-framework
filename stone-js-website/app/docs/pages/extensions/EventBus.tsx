import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extensions/event-bus'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { EventBus } from '@stone-js/event-bus'

@EventBus({ driver: 'eventbridge', source: 'my.app' })
@StoneApp({ name: 'orders' })
export class Application {}
`

const IMP = `
import { defineConfig } from '@stone-js/core'
import { defineEventBus } from '@stone-js/event-bus'

export const AppConfig = defineConfig(defineEventBus({
  default: 'cloud',
  targets: ['local', 'cloud'],
  connections: [{ name: 'cloud', driver: 'eventbridge', source: 'my.app' }]
}))
`

/**
 * Extensions: Event Bus.
 */
@Page(PATH, { layout: 'docs' })
export class EventBus implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Event Bus',
      description: 'Emit domain events to local and/or cloud targets, and route incoming bus events to @OnBusEvent handlers on any simple cloud adapter. EventBridge driver, key-router dispatch.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='Event Bus' />
        <Lead>
          <code>emit</code> on one side, <code>@OnBusEvent</code> on the other. The in-process
          <code> EventEmitter</code> already handles local events; <code>@stone-js/event-bus</code>
          handles the cloud: publish a domain event to <code>local</code> and/or <code>cloud</code>
          targets, and route incoming bus events to their handlers, on any simple cloud adapter. No
          dedicated adapter, no touching the core.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/event-bus
npm i @aws-sdk/client-eventbridge   # only for the EventBridge driver`}</Code>

        <H2>Emit</H2>
        <Principle
          principle={
            <p>
              Publishing a domain fact is part of the domain. Whether a listener is in this process or
              another service reached through a cloud bus is context. The code emits once; the runtime
              resolves who hears it.
            </p>
          }
          incarnation={
            <p>
              One <code>emit(name, payload, {'{'} targets {'}'})</code>. <code>local</code> uses the
              app's <code>EventEmitter</code> (used, not modified); <code>cloud</code> publishes
              through the driver. <code>eventBus</code> is injected.
            </p>
          }
        />
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />
        <Code file='app/OrderService.ts'>{`export class OrderService {
  constructor (private readonly eventBus) {}

  async ship (order) {
    // reaches in-process listeners AND the cloud bus, same code, monolith or distributed
    await this.eventBus.emit('order.shipped', { id: order.id }, { targets: ['local', 'cloud'] })
  }
}`}</Code>

        <H2>Listen, on any cloud adapter</H2>
        <p>
          The listener side needs no adapter of its own: it injects itself as the kernel event
          handler, exactly as <code>@stone-js/router</code> does. Stack <code>@BusListener()</code> on
          a simple cloud adapter (here AWS Lambda); the adapter receives the event, the bus routes it.
        </p>
        <Code file='app/Application.ts'>{`import { AwsLambda } from '@stone-js/aws-lambda-adapter'
import { BusListener } from '@stone-js/event-bus'

@BusListener({ source: 'detail-type' })   // which incoming property carries the routing key
@AwsLambda()
@StoneApp({ name: 'consumer' })
export class Application {}`}</Code>
        <Code file='app/Orders.ts'>{`import { BusHandler, OnBusEvent } from '@stone-js/event-bus'

@BusHandler()
export class Orders {
  @OnBusEvent('order.shipped')   async onShipped (payload) { /* … */ }
  @OnBusEvent('order.cancelled') async onCancelled (payload) { /* … */ }
}`}</Code>

        <H3>The routing key is configurable</H3>
        <p>
          The <code>source</code> names the incoming-event property holding the key. It defaults to
          <code> detail-type</code> (where the EventBridge driver puts the event name, so the pair
          round-trips), and is never hard-coded: set another property, or pass a full
          <code> extractor</code> for any bus shape.
        </p>
        <Code file='app/Application.ts'>{`@BusListener({ extractor: (event) => {
  const raw = event.get('metadata', {})
  return { key: raw.type, payload: raw.data }
}})`}</Code>

        <Callout kind='note' title='emit → Lambda → handler, and → postToConnection'>
          The consumer function is the generic cloud adapter plus the key-router, no bespoke wiring.
          The same emit-to-fan-out shape backs realtime on API Gateway: broadcast becomes an emit, a
          Lambda relays it to connections via <code>postToConnection</code>.
        </Callout>

        <H2>Drivers</H2>
        <PropsTable nameHeader='driver' rows={[
          { name: 'local', type: 'built-in', desc: 'The app EventEmitter. In-process delivery, zero-config.' },
          { name: 'memory', type: 'built-in', desc: 'Records emitted messages for tests and local dev.' },
          { name: 'eventbridge', type: 'AWS SDK', desc: 'PutEvents (Source / DetailType / Detail); rules fan out to consumer functions.' }
        ]} />

        <SeeAlso links={[
          { title: 'Queue', path: '/docs/extensions/queue' },
          { title: 'Realtime', path: '/docs/extensions/realtime' },
          { title: 'AWS API Gateway WebSocket adapter', path: '/docs/adapters/aws-apigw-ws' },
          { title: 'AWS Lambda adapter', path: '/docs/adapters/aws-lambda' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
