import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/adapters/aws-lambda'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { AwsLambdaHttp } from '@stone-js/aws-lambda-http-adapter'

@AwsLambdaHttp()   // API Gateway / Function URL HTTP events
@Routing()
@StoneApp({ name: 'tasks' })
export class Application {}
`

const IMP = `
import { defineStoneApp } from '@stone-js/core'
import { routerBlueprint } from '@stone-js/router'
import { awsLambdaHttpAdapterBlueprint } from '@stone-js/aws-lambda-http-adapter'

export const App = defineStoneApp(
  { name: 'tasks' },
  [routerBlueprint, awsLambdaHttpAdapterBlueprint]
)
`

/**
 * Adapters: AWS Lambda (HTTP + generic).
 */
@Page(PATH, { layout: 'docs' })
export class AwsLambda implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'AWS Lambda adapter',
      description: 'Run your domain on AWS Lambda: the HTTP adapter for API Gateway / Function URLs, and a generic adapter for non-HTTP invocations.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Adapters' title='AWS Lambda' />
        <Lead>
          AWS Lambda has its own event shape, so it gets its own adapter, in two flavours: an HTTP
          adapter for API Gateway and Function URLs, and a generic adapter for everything else Lambda
          delivers (queues, schedules, custom events).
        </Lead>

        <H2>HTTP on Lambda</H2>
        <p>
          For a web API behind API Gateway or a Function URL, use
          <code> @stone-js/aws-lambda-http-adapter</code>. Your routes work unchanged; the adapter maps
          the Lambda HTTP event to an intention and the response back.
        </p>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/aws-lambda-http-adapter`}</Code>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H3>Generic (non-HTTP) invocations</H3>
        <p>
          For events that are not HTTP, a queue message, a scheduled trigger, a custom payload, use the
          generic <code>@stone-js/aws-lambda-adapter</code> with <code>@AwsLambda()</code>. The same
          handler contract applies; the intention just carries the event's payload.
        </p>
        <Code file='app/Application.ts'>{`import { AwsLambda } from '@stone-js/aws-lambda-adapter'

@AwsLambda()
@StoneApp({ name: 'workers' })
export class Application {}`}</Code>

        <H2>Which one</H2>
        <PropsTable nameHeader='Package' rows={[
          { name: '@stone-js/aws-lambda-http-adapter', type: '@AwsLambdaHttp', desc: 'API Gateway / Function URL HTTP events. Use with @Routing.' },
          { name: '@stone-js/aws-lambda-adapter', type: '@AwsLambda', desc: 'Generic Lambda invocations (queues, schedules, custom).' }
        ]} />

        <H2>Deploy</H2>
        <p>
          Build the Lambda output and deploy the handler with your IaC of choice (SAM, CDK, Serverless
          Framework, Terraform). The ephemeral per-event container matches Lambda's execution model
          exactly, so there is nothing long-lived to warm but the adapter.
        </p>

        <Callout kind='future' title='Stack it to keep options open'>
          Add <code>@Fetch()</code> or <code>@NodeHttp()</code> alongside <code>@AwsLambdaHttp()</code>
          and the same build runs locally on Node, on the edge, and on Lambda; the runtime that
          receives the request collapses the choice.
        </Callout>

        <SeeAlso links={[
          { title: 'Edge & Serverless context', path: '/docs/contexts/edge' },
          { title: 'Fetch adapter', path: '/docs/adapters/fetch' },
          { title: 'Superposition & collapse', path: '/docs/foundations/superposition' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
