import { JSX } from 'react'
import { CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/foundations/superposition'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { NodeHttp } from '@stone-js/node-http-adapter'
import { Fetch } from '@stone-js/fetch-adapter'
import { AwsLambdaHttp } from '@stone-js/aws-lambda-http-adapter'

// Three contexts, superposed on one domain. None is chosen here.
@NodeHttp()
@Fetch()
@AwsLambdaHttp()
@Routing()
@StoneApp({ name: 'tasks' })
export class Application {}
`

const IMP = `
import { defineStoneApp } from '@stone-js/core'
import { routerBlueprint } from '@stone-js/router'
import { nodeHttpAdapterBlueprint } from '@stone-js/node-http-adapter'
import { fetchAdapterBlueprint } from '@stone-js/fetch-adapter'
import { awsLambdaHttpAdapterBlueprint } from '@stone-js/aws-lambda-http-adapter'

export const App = defineStoneApp(
  { name: 'tasks' },
  [routerBlueprint, nodeHttpAdapterBlueprint, fetchAdapterBlueprint, awsLambdaHttpAdapterBlueprint]
)
`

/**
 * Foundations: superposition and collapse.
 */
@Page(PATH, { layout: 'docs' })
export class Superposition implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Superposition & collapse',
      description: 'Stack many contexts on one domain. None is selected until, at runtime, a real cause collapses the domain into exactly one.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Foundations' title='Superposition & collapse' />
        <Lead>
          The uncertainty principle said to keep the where open. This is what keeping it open buys
          you: a domain can hold many possible contexts at once, and commit to one only at the last
          possible instant, when a real event arrives.
        </Lead>

        <H2>Adapters superpose</H2>
        <Principle
          principle={
            <p>
              Choosing a runtime is usually a build-time, irreversible commitment. But if the domain
              names no runtime, there is nothing stopping several runtimes from coexisting around it.
              The choice can be a value carried until execution, not a fork taken during design.
            </p>
          }
          incarnation={
            <p>
              Stack as many adapters as you like on one <code>Application</code>. Each is a latent
              context. Working on Node while a Lambda and an edge worker sit in the same manifest is
              not a special mode; it is the default, because adapters do not exclude one another.
            </p>
          }
        />
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H2>Runtime is the collapse</H2>
        <p>
          The selection does not happen when you write the code, nor when you build. It happens when
          a concrete cause reaches a concrete adapter: an HTTP request hits the Node adapter, an
          invocation reaches the Lambda adapter, a fetch arrives at the edge. That adapter, and only
          it, collapses the domain into a running application for that one event.
        </p>
        <Aphorism>The adapters are the possibilities. The cause that arrives is the measurement. The response is the collapse.</Aphorism>

        <H3>One artifact, two collapses</H3>
        <p>
          Take the manifest above, Node and Lambda stacked, and build it once. The same artifact
          collapses differently depending only on where it runs:
        </p>
        <ul>
          <li><strong>Locally</strong>: run it and Stone.js resolves the Node adapter at run time; requests collapse onto Node.</li>
          <li><strong>On Lambda</strong>: deploy that exact artifact and, at run time there, Stone.js resolves the Lambda adapter; invocations collapse onto Lambda.</li>
        </ul>
        <p>
          Nothing chose between them at build, and deployment only decided where the artifact lives.
          The collapse is a runtime act, performed freshly wherever the app happens to run.
        </p>

        <H2>Why decoherence lives at the edge</H2>
        <p>
          The collapse is confined to the integration dimension, the adapter. Everything inward, the
          kernel and your domain, only ever sees the result: one normalised intention. The messy
          business of turning a raw platform cause into a clean intention never propagates into your
          logic, which is why the same logic survives every collapse.
        </p>

        <Callout kind='future' title='SSR, SPA and agents are the same trick'>
          A universal app is a browser context and a server context superposed, collapsing in
          sequence. An agent-ready service adds an MCP context to the stack. None of these are
          separate architectures; they are the same superposition, with different adapters in it.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
