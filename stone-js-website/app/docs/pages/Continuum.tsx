import { JSX } from 'react'
import { Code } from '../components/Code'
import { siblings } from '../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Aphorism, Pager } from '../components/content'

const PATH = '/docs/foundations/continuum'

/**
 * Foundations: the Continuum, the core mental model.
 */
@Page(PATH, { layout: 'docs' })
export class Continuum implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'The Continuum',
      description: 'An application is an act, not an object: a domain meeting a context, resolving into a response. The four dimensions of the Continuum.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Foundations' title='The Continuum' />
        <Lead>
          This is the one idea the rest of the framework serves. Once it clicks, adapters,
          blueprints, the container and the lifecycle stop being features to memorise and become
          obvious consequences, and the idea outlives any single stack.
        </Lead>

        <H2>An application is an act</H2>
        <Principle
          principle={
            <>
              <p>
                We are taught to think of an application as a thing: a binary, a server, a bundle.
                But nothing happens until something arrives, a request, a message, a command, and
                something responds. The application only exists in that meeting. It is an <em>act</em>,
                not an object.
              </p>
              <p>
                Name the two parts of the act. The <strong>domain</strong> is what your software
                means: its rules, its language, the part that would still be true on any platform.
                The <strong>context</strong> is everything the domain does not control: the runtime,
                the protocol, the shape of the input, the way a response leaves.
              </p>
            </>
          }
          incarnation={
            <>
              <p>
                Stone.js takes the radical position: it <strong>is</strong> the context. You write
                the domain once; the framework supplies the context at execution and applies it to
                your domain, not the other way around.
              </p>
              <p>
                So a Stone.js app has no <code>main()</code> that reaches out to a server. It
                declares a domain and lets a context arrive. The same class is an HTTP handler, a
                Lambda, an edge function or an agent tool depending only on which context collapses
                onto it.
              </p>
            </>
          }
        />

        <Aphorism cite='The Continuum Architecture manifesto'>
          Application = Domain × Context → Resolution
        </Aphorism>

        <H2>The four dimensions</H2>
        <p>
          The act unfolds across four dimensions. Each has a precise incarnation in the framework,
          and each later page in Foundations lives in one of them.
        </p>
        <Principle
          principle={
            <ul>
              <li><strong>Setup</strong>: describe the application once, before anything runs.</li>
              <li><strong>Integration</strong>: capture a raw cause and normalise it into an intention.</li>
              <li><strong>Initialization</strong>: apply the domain to that intention, per event.</li>
              <li><strong>Functional</strong>: your logic, running, unaware of the platform.</li>
            </ul>
          }
          incarnation={
            <ul>
              <li><strong>Setup</strong> → the <code>Blueprint</code>, built from your decorators or define* modules.</li>
              <li><strong>Integration</strong> → the <code>Adapter</code>, one per platform, turning a cause into an <code>IncomingEvent</code>.</li>
              <li><strong>Initialization</strong> → the <code>Kernel</code>, with a fresh container per event.</li>
              <li><strong>Functional</strong> → your handlers and services. No imposed structure.</li>
            </ul>
          }
        />

        <H2>Why this buys you freedom</H2>
        <p>
          Because the domain never names the context, the context can change without the domain
          knowing. Move from a container to a Lambda to an edge worker, and the code that expresses
          what your product does is untouched. The platform churn of the last thirty years becomes
          a deployment detail.
        </p>

        <Code file='app/Application.ts'>{`// The manifest names contexts. The domain, elsewhere, never does.
@NodeHttp()
@AwsLambdaHttp()
@Routing()
@StoneApp()
export class Application {}`}</Code>

        <Callout kind='future' title='The core stays agnostic, on purpose'>
          There is no HTTP, CLI or browser vocabulary inside the kernel. That is not an omission,
          it is the whole point. Anything platform-specific lives in an adapter at the edge, so the
          center can outlive every platform it runs on.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
