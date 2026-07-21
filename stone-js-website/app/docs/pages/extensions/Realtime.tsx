import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extensions/realtime'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Realtime } from '@stone-js/realtime'

@Realtime({ driver: 'redis', url: 'redis://localhost:6379' })
@StoneApp({ name: 'app' })
export class Application {}
`

const IMP = `
import { defineConfig } from '@stone-js/core'
import { defineRealtime } from '@stone-js/realtime'

export const AppConfig = defineConfig(defineRealtime({
  default: 'redis',
  connections: [
    { name: 'redis', driver: 'redis', url: 'redis://localhost:6379', prefix: 'rt' },
    { name: 'local', driver: 'memory' }
  ]
}))
`

/**
 * Extensions: Realtime.
 */
@Page(PATH, { layout: 'docs' })
export class Realtime implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Realtime',
      description: 'One Broadcaster API for backend and frontend: broadcast on channels, track presence, fan out over memory or Redis. Gateways with @OnConnect/@OnEvent and an isomorphic client.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='Realtime' />
        <Lead>
          One API to push live updates, on the server and in the browser alike.
          <code> @stone-js/realtime</code> gives you a single <code>Broadcaster</code>: publish an
          event on a channel with <code>to(channel).emit(event, payload)</code>, subscribe with
          <code> on(channel, listener)</code>, and read <code>members(channel)</code> for presence.
          It runs over an in-process broadcaster (zero-config) or Redis pub/sub, and the exact same
          API backs the isomorphic client.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/realtime
npm i ioredis   # only for the Redis (multi-node) fan-out
npm i ws        # only for the Node client (the browser uses the global WebSocket)`}</Code>

        <H2>Enable it</H2>
        <Principle
          principle={
            <p>
              Emitting a live update is part of the domain. Which socket carries it, and whether it
              fans out across one node or a fleet, is context. The domain should write the intent
              once and let the runtime resolve the transport.
            </p>
          }
          incarnation={
            <p>
              One agnostic <code>Broadcaster</code> contract backs every driver. The provider binds
              the manager as <code>realtimeManager</code>, the default connection as
              <code> realtime</code>, and the <code>realtimeRouter</code> the transports dispatch
              into. The core is never touched.
            </p>
          }
        />
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H3>Broadcast</H3>
        <Code file='app/OrderService.ts'>{`export class OrderService {
  constructor (private readonly realtime) {}          // the default broadcaster

  async ship (order) {
    // every subscriber of the channel receives it, on this node or across the Redis fleet
    await this.realtime.to(\`order:\${order.id}\`).emit('shipped', { at: Date.now() })
  }
}`}</Code>

        <H3>Listen with a gateway</H3>
        <p>
          A gateway is a plain, dependency-injected class. Its methods react to connection lifecycle
          events and to specific channel events, one method each:
        </p>
        <Code file='app/Chat.ts'>{`import { RealtimeGateway, OnConnect, OnDisconnect, OnEvent } from '@stone-js/realtime'

@RealtimeGateway()
export class Chat {
  constructor (private readonly realtime) {}

  @OnConnect()    onConnect (connection)  { /* greet, authorize… */ }
  @OnDisconnect() onLeave (connection)    { /* clean up presence… */ }

  @OnEvent('room:1', 'message')
  async onMessage (payload, connection) {
    await this.realtime.to('room:1').emit('message', payload)
  }
}`}</Code>
        <p>
          The full set of method decorators: <code>@OnConnect</code>, <code>@OnDisconnect</code>,
          <code> @OnMessage</code>, <code>@OnError</code>, <code>@OnSubscribe</code>,
          <code> @OnUnsubscribe</code> and <code>@OnEvent(channel, event)</code>.
        </p>

        <H3>Presence</H3>
        <Code file='app/Room.ts'>{`export class Room {
  constructor (private readonly realtime) {}
  async who (channel: string) {
    return await this.realtime.members(channel)   // [{ connectionId, info }]
  }
}`}</Code>

        <H3>On the frontend</H3>
        <p>
          The isomorphic client speaks the same <code>Broadcaster</code> API, so the code that emits
          and listens is written once. The browser uses the global <code>WebSocket</code>; on Node it
          loads <code>ws</code> lazily.
        </p>
        <Code file='app/live.ts'>{`import { RealtimeClient } from '@stone-js/realtime'

const realtime = RealtimeClient.create({ url: 'wss://api.example.com/ws' })

realtime.on('room:1', (message) => render(message.payload))
await realtime.to('room:1').emit('message', { text: 'hi' })`}</Code>
        <Callout kind='note' title='The socket server is an adapter'>
          This package is the agnostic core: the broadcaster, channels, presence and the router. The
          WebSocket server that holds connections ships as an adapter (<code>node-ws</code>,
          <code> aws-apigw-ws</code>), which populates the connection store and dispatches lifecycle
          events into the same router. Build once, run the transport that fits the context.
        </Callout>

        <H2>Drivers</H2>
        <PropsTable nameHeader='driver' rows={[
          { name: 'memory', type: 'built-in', desc: 'In-process fan-out to local listeners and held connections. Zero-config default; single node.' },
          { name: 'redis', type: 'ioredis', desc: 'Pub/sub fan-out across every node: publish on a channel, each instance delivers to its local sockets.' },
          { name: 'provider', type: 'coming next', desc: 'Cloud fan-out (EventBridge, Momento, Ably) wired as a driver, never grafted onto core.' }
        ]} />

        <SeeAlso links={[
          { title: 'Queue', path: '/docs/extensions/queue' },
          { title: 'Cache', path: '/docs/extensions/cache' },
          { title: 'Service container & DI', path: '/docs/foundations/container' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
