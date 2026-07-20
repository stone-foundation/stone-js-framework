import { JSX } from 'react'
import { Code } from '../../docs/components/Code'
import { Architecture } from '../components/Architecture'
import { ArticleLayout, articleHead } from '../ArticleLayout'
import { HeadContext, IPage, Page, ReactIncomingEvent, StoneLink } from '@stone-js/use-react'

const SLUG = 'real-time-features'

/**
 * Blog: Real-time features, live updates and presence (architecture, deferred module).
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

        <Architecture
          caption='A client subscribes; a change becomes an event; subscribers hear it. The same intention model, held open.'
          nodes={[
            { label: 'Client', sub: 'subscribes: SSE / WebSocket', tone: 'client' },
            { label: 'Adapter', sub: 'holds the connection', tone: 'context' },
            { label: 'Handler', sub: 'a change becomes an event', tone: 'domain' },
            { label: 'Broadcast', sub: 'to subscribers · presence', tone: 'store' }
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

        <h2>What you can build today</h2>
        <p>
          You do not have to wait to ship live features. A subscription is a route, and pushing an update
          is a response held open. Today you wire the stream in a handler with the tools your runtime
          gives you; the routing, the per-event model and the adapters are all already here.
        </p>
        <Code file='app/LiveController.ts'>{`import { EventHandler, Get } from '@stone-js/router'

@EventHandler('/live')
export class LiveController {
  @Get('/tasks')
  stream (event) {
    // A subscription is an event held open. Today you return a
    // text/event-stream response and push updates as changes happen,
    // using your runtime's streaming primitives.
    // @stone-js/realtime (on the way) will make the channel, the
    // fan-out and presence ergonomic, without changing this shape.
  }
}`}</Code>
        <p>
          The comment is the honest boundary. The route and the per-event model are Stone.js; the stream
          itself is wired by hand for now. The upcoming <code>@stone-js/realtime</code> module will turn
          channels, broadcast fan-out and presence into a blueprint concern, the same way the runtime is
          already an adapter concern, so the connection plumbing disappears and the handler stays exactly
          this small.
        </p>

        <h2>Why it matters</h2>
        <ul>
          <li><strong>The transport is not your logic.</strong> SSE or WebSocket is a context detail an adapter should own, not something threaded through your domain.</li>
          <li><strong>It runs where you run.</strong> Holding a connection is the runtime's job, so the same live handler works on Node, serverless and the edge.</li>
          <li><strong>Nothing to rewrite later.</strong> The handler shape you build today is the one the realtime module will slot under, so adopting it is additive.</li>
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
