import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/adapters/tencent-scf'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { TencentScfHttp } from '@stone-js/tencent-scf-http-adapter'

@TencentScfHttp()   // Tencent SCF HTTP (API Gateway) trigger
@Routing()
@StoneApp({ name: 'tasks' })
export class Application {}
`

const IMP = `
import { defineStoneApp } from '@stone-js/core'
import { routerBlueprint } from '@stone-js/router'
import { tencentScfHttpAdapterBlueprint } from '@stone-js/tencent-scf-http-adapter'

export const App = defineStoneApp(
  { name: 'tasks' },
  [routerBlueprint, tencentScfHttpAdapterBlueprint]
)
`

/**
 * Adapters: Tencent Cloud SCF (HTTP).
 */
@Page(PATH, { layout: 'docs' })
export class TencentScf implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Tencent Cloud SCF adapter',
      description: 'Run your domain on Tencent Cloud Serverless Cloud Function HTTP triggers, unchanged. The adapter maps the API Gateway proxy event to an intention and back.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Adapters' title='Tencent Cloud SCF' />
        <Lead>
          Tencent Cloud Serverless Cloud Function fronts HTTP with API Gateway's proxy integration: the
          function is invoked with a proxy event (<code>httpMethod</code>, <code>path</code>,
          <code> headers</code>, <code>queryString</code>, <code>body</code>) and returns
          <code> {'{ statusCode, headers, body, isBase64Encoded }'}</code>.
          <code> @stone-js/tencent-scf-http-adapter</code> maps that to an intention, runs your kernel,
          and returns the response, so your routes run on SCF unchanged.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/tencent-scf-http-adapter`}</Code>

        <H2>Enable it</H2>
        <p>
          Add the decorator (or the blueprint) to the manifest. Your routes, validation, cookies and
          request/response model are the runtime-agnostic ones from <code>@stone-js/http-core</code>;
          nothing in the domain changes.
        </p>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H3>Register the handler</H3>
        <p>
          <code>run()</code> returns the <code>(event, context)</code> handler SCF invokes. Export it as
          the function entry point.
        </p>
        <Code file='index.js'>{`// The SCF function entry
exports.main_handler = await stoneApp.run()`}</Code>

        <Callout kind='note' title='Enable proxy integration'>
          Turn on API Gateway's proxy integration ("集成响应") and base64 for binary so SCF passes the
          full request event and returns the structured response the adapter builds.
        </Callout>

        <H2>Generic (non-HTTP) triggers</H2>
        <p>
          For triggers that are not HTTP, a COS object change, a CMQ/TDMQ message, a Timer or CKafka
          records, use the generic <code>@stone-js/tencent-scf-adapter</code> with
          <code> @TencentScf()</code>. The function is invoked with <code>(event, context)</code>; the
          adapter normalizes it into an intention whose metadata carries the event payload, so one
          handler can dispatch on the trigger.
        </p>
        <Code file='app/Application.ts'>{`import { TencentScf } from '@stone-js/tencent-scf-adapter'

@TencentScf()
@StoneApp({ name: 'workers' })
export class Application {}`}</Code>
        <p>
          On a thrown error the adapter rethrows by default so SCF applies its retry / dead-letter
          policy; opt out with <code>stone.adapter.rethrowOnError = false</code>.
        </p>

        <H2>Deploy</H2>
        <p>
          Build the function output and deploy with Serverless Framework or the console. The
          per-invocation model matches the Continuum's per-event context exactly.
        </p>
        <Code file='terminal' lang='bash'>{`npm run build
serverless deploy`}</Code>

        <H2>Triggers</H2>
        <PropsTable nameHeader='Package' rows={[
          { name: '@stone-js/tencent-scf-http-adapter', type: '@TencentScfHttp', desc: 'HTTP-triggered functions (API Gateway proxy event). Use with @Routing.' },
          { name: '@stone-js/tencent-scf-adapter', type: '@TencentScf', desc: 'Generic event triggers (COS, CMQ/TDMQ, Timer, CKafka).' }
        ]} />

        <Callout kind='future' title='Stack it to keep options open'>
          Add <code>@NodeHttp()</code> or <code>@Fetch()</code> alongside
          <code> @TencentScfHttp()</code> and the same build runs locally on Node, on the edge, and on
          SCF; the runtime that receives the request collapses the choice.
        </Callout>

        <SeeAlso links={[
          { title: 'Edge & Serverless context', path: '/docs/contexts/edge' },
          { title: 'AWS Lambda adapter', path: '/docs/adapters/aws-lambda' },
          { title: 'Alibaba Cloud FC adapter', path: '/docs/adapters/alibaba-fc' },
          { title: 'Superposition & collapse', path: '/docs/foundations/superposition' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
