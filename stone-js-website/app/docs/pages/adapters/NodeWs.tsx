import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/adapters/node-ws'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Realtime } from '@stone-js/realtime'
import { NodeWs } from '@stone-js/node-ws-adapter'

@NodeWs({ url: 'ws://localhost:8080' })
@Realtime({ driver: 'memory' })
@StoneApp({ name: 'chat' })
export class Application {}
`

const IMP = `
import { defineStoneApp } from '@stone-js/core'
import { realtimeBlueprint } from '@stone-js/realtime'
import { nodeWsAdapterBlueprint } from '@stone-js/node-ws-adapter'

export const App = defineStoneApp(
  { name: 'chat' },
  [realtimeBlueprint, nodeWsAdapterBlueprint]
)
`

/**
 * Adapters: Node.js WebSocket.
 */
@Page(PATH, { layout: 'docs' })
export class NodeWs implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Node WebSocket adapter',
      description: 'Run a `ws` server that bridges sockets to @stone-js/realtime: channels, presence and @On* gateways, with optional per-message kernel dispatch.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Adapters' title='Node WebSocket' />
        <Lead>
          The server side of realtime on Node. <code>@stone-js/node-ws-adapter</code> runs a
          <code> ws</code> server and bridges every socket to <code>@stone-js/realtime</code>: each
          connection joins the shared connection store, so a <code>broadcast</code> from anywhere
          reaches it, and its lifecycle drives your <code>@On*</code> gateways. Your domain code stays
          the agnostic one; the socket is the context.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/node-ws-adapter @stone-js/realtime
npm i ws   # the WebSocket server (optional peer, imported lazily)`}</Code>

        <H2>Enable it</H2>
        <p>
          Stack the adapter on top of <code>@stone-js/realtime</code>. The adapter binds a server on
          <code> stone.adapter.url</code> (default <code>ws://localhost:8080</code>); realtime provides
          the broadcaster, channels and presence.
        </p>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H3>Gateways react to sockets</H3>
        <p>
          A gateway is a plain, dependency-injected class. The adapter dispatches connection lifecycle
          and channel events into it, one method each:
        </p>
        <Code file='app/Chat.ts'>{`import { RealtimeGateway, OnConnect, OnDisconnect, OnEvent } from '@stone-js/realtime'

@RealtimeGateway()
export class Chat {
  constructor (private readonly realtime) {}

  @OnConnect()    onConnect (connection) { /* authorize, greet… */ }
  @OnDisconnect() onLeave (connection)   { /* clean up presence… */ }

  @OnEvent('room:1', 'message')
  async onMessage (payload, connection) {
    await this.realtime.to('room:1').emit('message', payload)   // fans out to every subscriber
  }
}`}</Code>

        <H2>The frame protocol</H2>
        <p>
          Clients speak a tiny JSON protocol, the same one the isomorphic <code>RealtimeClient</code>
          emits: a control frame to join or leave a channel, and a data frame to send an event.
        </p>
        <Code file='wire.json'>{`{ "type": "subscribe",   "channel": "room:1" }
{ "type": "unsubscribe", "channel": "room:1" }
{ "channel": "room:1", "event": "message", "payload": { "text": "hi" } }`}</Code>

        <Callout kind='note' title='Run the same handlers through the kernel'>
          Set <code>stone.adapter.dispatchToKernel = true</code> and each data frame is additionally
          normalized into an <code>IncomingEvent</code> and run through your kernel (middleware,
          routing, handlers); the handler's response is sent back to the sender. Leave it off for a
          pure gateway/broadcast app.
        </Callout>

        <H2>Configuration</H2>
        <PropsTable nameHeader='key' rows={[
          { name: 'stone.adapter.url', type: 'ws://localhost:8080', desc: 'The bind URL (host + port).' },
          { name: 'stone.adapter.server', type: '{}', desc: 'Options forwarded to the ws WebSocketServer (e.g. attach to an http server).' },
          { name: 'stone.adapter.dispatchToKernel', type: 'false', desc: 'Also route each data frame through the kernel and reply to the sender.' }
        ]} />

        <Callout kind='future' title='Scale out with Redis, and edge with API Gateway'>
          Switch realtime to <code>{"{ driver: 'redis' }"}</code> and a broadcast fans out across every
          node. On serverless, the AWS API Gateway WebSocket adapter drives the same gateways from
          <code> $connect</code> / <code>$disconnect</code> / messages, no code change.
        </Callout>

        <SeeAlso links={[
          { title: 'Realtime', path: '/docs/extensions/realtime' },
          { title: 'Node HTTP adapter', path: '/docs/adapters/node-http' },
          { title: 'Service container & DI', path: '/docs/foundations/container' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
