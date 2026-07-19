import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/foundations/adapters'

/**
 * Foundations: adapters (the integration dimension).
 */
@Page(PATH, { layout: 'docs' })
export class Adapters implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Adapters',
      description: 'The integration dimension: an adapter turns a platform cause into an intention, and the domain’s resolution back into a native effect.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Foundations' title='Adapters' />
        <Lead>
          The adapter is the integration dimension, the boundary between a platform and your domain.
          It is the only long-lived thing in a Stone.js app, and the only thing that speaks a
          platform's language. Everything inward is agnostic because the adapter absorbs the specific.
        </Lead>

        <H2>Cause in, effect out</H2>
        <Principle
          principle={
            <p>
              Every platform delivers work differently: an HTTP request object, a Lambda event, a
              fetch <code>Request</code>, an argv, a tool call. If each of those is translated at the
              boundary into one common shape, the code behind the boundary never has to learn the
              platform's dialect.
            </p>
          }
          incarnation={
            <p>
              An adapter does three things. It <strong>captures</strong> the raw cause the platform
              delivers, <strong>normalises</strong> it into an <code>IncomingEvent</code> (the
              intention the kernel and your domain read), and <strong>emits</strong> the kernel's
              response as the platform's native effect.
            </p>
          }
        />
        <Aphorism>Capture the cause. Normalise it to an intention. Emit the effect. That is a context, in three verbs.</Aphorism>

        <H2>Where the collapse happens</H2>
        <p>
          The adapter is where superposition becomes a single running application. Stack several
          adapters and each waits, long-lived, for its platform's cause. When one arrives, that
          adapter builds the per-event context, runs the kernel, and maps the result back. The
          decoherence, the messy translation from raw reality to clean intention, is confined here
          and never leaks inward.
        </p>
        <Code file='app/Application.ts'>{`// Each decorator adds one adapter (one context) to the manifest.
@NodeHttp()       // captures Node's IncomingMessage
@AwsLambdaHttp()  // captures API Gateway events
@Fetch()          // captures the Web-standard Request
@Routing()
@StoneApp({ name: 'tasks' })
export class Application {}`}</Code>

        <H2>Long-lived by design</H2>
        <p>
          The adapter persists for the life of the process; everything it produces, the container and
          the domain instances, is per-event and discarded. This split is deliberate: it is what lets
          the ephemeral context stay clean while the connection to the platform stays open.
        </p>

        <Callout kind='future' title='New runtime? Write an adapter'>
          Because the core defines the boundary and nothing beyond it, supporting a platform that does
          not exist yet is one package: an adapter that captures, normalises and emits. The Frontier
          section walks through writing one. The kernel never changes.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
