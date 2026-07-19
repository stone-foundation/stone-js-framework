import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/contexts/edge'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { Fetch } from '@stone-js/fetch-adapter'
import { AwsLambdaHttp } from '@stone-js/aws-lambda-http-adapter'

@Fetch()          // Cloudflare, Deno, Bun, Vercel, Netlify (Web-standard)
@AwsLambdaHttp()  // ...and AWS Lambda, stacked
@Routing()
@StoneApp()
export class Application {}
`

const IMP = `
import { defineStoneApp } from '@stone-js/core'
import { routerBlueprint } from '@stone-js/router'
import { fetchAdapterBlueprint } from '@stone-js/fetch-adapter'
import { awsLambdaHttpAdapterBlueprint } from '@stone-js/aws-lambda-http-adapter'

export const App = defineStoneApp(
  { name: 'tasks' },
  [routerBlueprint, fetchAdapterBlueprint, awsLambdaHttpAdapterBlueprint]
)
`

/**
 * Contexts: edge and serverless.
 */
@Page(PATH, { layout: 'docs' })
export class Edge implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Edge & Serverless',
      description: 'One Web-standard adapter for Cloudflare, Deno, Bun, Vercel and Netlify, plus AWS Lambda: the same Tasks domain, no rewrite.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Contexts' title='Edge & Serverless' />
        <Lead>
          This is the context that most punishes coupling. Every platform has its own handler
          signature, its own request object, its own cold-start rules. A domain welded to any one
          of them cannot follow the industry as it moves. A domain that deferred the where just
          ships.
        </Lead>

        <H2>The industry standardised. So did we.</H2>
        <Aphorism>
          Cloudflare, Deno, Bun, Vercel and Netlify all speak the Web platform's Request and
          Response. One adapter speaks it too.
        </Aphorism>
        <p>
          <code>@stone-js/fetch-adapter</code> is a single adapter built on the Web-standard
          <code> Request</code>/<code>Response</code> (WinterCG). It normalises the cause on any
          fetch-based runtime into the same <code>IncomingEvent</code> your domain already reads.
          AWS Lambda has its own event shape, so it gets its own adapter, and both stack.
        </p>

        <H2>Collapse it onto the edge</H2>
        <p>
          The Tasks domain does not appear here, because it does not change. Only the manifest does.
        </p>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />
        <Code file='terminal' lang='bash'>{`npm run build            # build for your target
# deploy the output to Cloudflare, Deno Deploy, Vercel, Netlify, or Lambda
# the handlers are byte-for-byte the same across all of them`}</Code>

        <H2>Why this is the payoff of the whole model</H2>
        <p>
          This is where it all pays off. The domain never named a platform, so moving from a Worker
          to a Lambda to a Deno isolate is a deployment decision, taken long after the logic was
          written, and reversible.
        </p>

        <Callout kind='note' title='Cold starts respect the model'>
          The ephemeral context (a fresh container per event) fits serverless exactly: nothing
          long-lived to warm except the adapter. The domain pays no tax for portability.
        </Callout>

        <Callout kind='future' title='Deferred collapse, made literal'>
          Stack the fetch and Lambda adapters and neither is chosen when you write the code, nor
          when you build. The cause that arrives at runtime selects which adapter collapses the
          domain. Superposition is not a diagram here, it is your deploy pipeline.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
