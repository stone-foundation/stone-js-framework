import { JSX } from 'react'
import { Code } from '../../docs/components/Code'
import { Diagram } from '../components/Diagram'
import { ArticleLayout, articleHead } from '../ArticleLayout'
import { HeadContext, IPage, Page, ReactIncomingEvent, StoneLink } from '@stone-js/use-react'

const SLUG = 'real-time-features'

/**
 * Blog: Real-time features, live updates and presence.
 */
@Page(`/blog/${SLUG}`, { layout: 'site' })
export class RealTimeFeatures implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return articleHead(SLUG)
  }

  render (): JSX.Element {
    return (
      <ArticleLayout slug={SLUG}>
        <p className='doc-lead'>
          A dashboard that updates the moment a number changes, a cursor that shows who else is in the
          room, a notification that arrives without a refresh: these are the features users now expect,
          and they all share one shape. Something changes on the server, and the clients who care need
          to hear about it without asking.
        </p>

        <h2>Two transports, one shape</h2>
        <p>
          Real-time on the web comes down to two transports. <strong>Server-Sent Events</strong> (SSE) is
          a one-way stream from server to client over plain HTTP: ideal for live updates, feeds and
          notifications, and it rides through proxies and CDNs like any other response.
          <strong> WebSockets</strong> add a two-way channel, which is what presence and collaborative
          editing want, at the cost of a stateful connection. Most live dashboards need only the first.
        </p>

        <Diagram
          caption='A client subscribes; a change becomes an event; subscribers hear it. The connection is the adapter’s to hold, so the same gateway runs on Node WebSockets or API Gateway.'
          nodes={[
            { label: 'Client', sub: 'SSE / WebSocket', kind: 'client' },
            { label: 'Adapter', sub: 'holds the connection', kind: 'context' },
            { label: 'Gateway', sub: '@RealtimeGateway', kind: 'domain' },
            { label: 'Broadcast', sub: 'fan-out · presence', kind: 'store' }
          ]}
        />

        <h2>How it fits the per-event model</h2>
        <p>
          Stone.js resolves one intention per event, and a real-time stream does not break that: a
          subscription is an event that happens to stay open, and each thing pushed down it is a
          resolution. The adapter owns the awkward part, the long-lived connection, exactly as the HTTP
          adapter owns the request and response. Your handler stays a function of an intention: it
          decides what a subscriber should receive, not how the socket is held.
        </p>
        <p>
          On the edge this matters even more. Edge platforms expose streaming responses and their own
          connection primitives, so where a stream is held is a property of the runtime, which is
          precisely the thing an adapter is meant to absorb. The same handler that streams from a Node
          server should stream from the edge, unchanged.
        </p>

        <h2>How you build it</h2>
        <p>
          <code>@stone-js/realtime</code> turns channels, broadcast fan-out and presence into a blueprint
          concern, the same way the runtime is already an adapter concern. You write a gateway; its
          <code> @On*</code> methods react to socket lifecycle and channel events, and the broadcaster
          fans a message out to every subscriber. The connection plumbing is gone.
        </p>
        <Code file='app/ChatGateway.ts'>{`import { RealtimeGateway, OnConnect, OnEvent, connectionOf } from '@stone-js/realtime'

@RealtimeGateway()
export class ChatGateway {
  constructor (private readonly realtime) {}

  @OnConnect()
  async onConnect (_payload, event) {
    await this.realtime.to('room:general').emit('presence', { joined: connectionOf(event)?.id })
  }

  @OnEvent('room:general', 'message')
  async onMessage (payload) {
    await this.realtime.to('room:general').emit('message', payload)  // fan out to every subscriber
  }
}`}</Code>
        <p>
          Because the gateway is dispatched through the kernel by the router, the exact same class runs on
          <code> @stone-js/node-ws-adapter</code> and on <code>@stone-js/aws-apigw-ws-adapter</code>: a
          different adapter on the app, no change to the gateway. Switch the broadcaster from memory to
          Redis and presence and broadcasts span every node. The <code>realtime-chat</code> starter below
          is this, ready to run.
        </p>

        <h2>Why it matters</h2>
        <ul>
          <li><strong>The transport is not your logic.</strong> SSE or WebSocket is a context detail an adapter should own, not something threaded through your domain.</li>
          <li><strong>It runs where you run.</strong> Holding a connection is the runtime's job, so the same live handler works on Node, serverless and the edge.</li>
          <li><strong>The same gateway, every transport.</strong> Node WebSockets today, API Gateway on serverless, the edge next: the gateway is dispatched through the kernel, so the transport is the adapter’s concern, not yours.</li>
        </ul>

        <p>
          The subscription is ordinary routing, so
          <StoneLink to='/docs/routing/matching'> Matching and precedence</StoneLink> explains how it is
          chosen, and <StoneLink to='/docs/foundations/adapters'> Adapters</StoneLink> explains why the
          connection belongs to the runtime and not to you.
        </p>
      </ArticleLayout>
    )
  }
}
