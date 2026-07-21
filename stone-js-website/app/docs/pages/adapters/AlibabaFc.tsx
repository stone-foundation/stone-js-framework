import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/adapters/alibaba-fc'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { AlibabaFcHttp } from '@stone-js/alibaba-fc-http-adapter'

@AlibabaFcHttp()   // Alibaba FC HTTP trigger
@Routing()
@StoneApp({ name: 'tasks' })
export class Application {}
`

const IMP = `
import { defineStoneApp } from '@stone-js/core'
import { routerBlueprint } from '@stone-js/router'
import { alibabaFcHttpAdapterBlueprint } from '@stone-js/alibaba-fc-http-adapter'

export const App = defineStoneApp(
  { name: 'tasks' },
  [routerBlueprint, alibabaFcHttpAdapterBlueprint]
)
`

/**
 * Adapters: Alibaba Cloud Function Compute (HTTP).
 */
@Page(PATH, { layout: 'docs' })
export class AlibabaFc implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Alibaba Cloud Function Compute adapter',
      description: 'Run your domain on Alibaba Cloud Function Compute HTTP triggers, unchanged. The adapter maps FC\'s (req, resp, context) handler to an intention and back.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Adapters' title='Alibaba Cloud Function Compute' />
        <Lead>
          Alibaba Cloud Function Compute is the largest serverless platform in China, with a global
          footprint. Its HTTP trigger (FC 2.0) invokes the function with
          <code> (req, resp, context)</code>, a plain request (body pre-read into a
          <code> Buffer</code>) and an imperative response. <code>@stone-js/alibaba-fc-http-adapter</code>
          maps that to an intention, runs your kernel, and writes the response, so your routes run on
          FC unchanged.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/alibaba-fc-http-adapter`}</Code>

        <H2>Enable it</H2>
        <p>
          Add the decorator (or the blueprint) to the manifest. Your routes, validation, cookies and
          request/response model are the runtime-agnostic ones from <code>@stone-js/http-core</code>;
          nothing in the domain changes.
        </p>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H3>Register the handler</H3>
        <p>
          <code>run()</code> returns the <code>(req, resp, context)</code> handler FC invokes. Export
          it as the function entry point.
        </p>
        <Code file='index.js'>{`// The FC HTTP function entry
exports.handler = await stoneApp.run()`}</Code>

        <Callout kind='note' title='FC 3.0 needs no adapter'>
          FC 3.0 runs a container with an ordinary HTTP server. Use
          <code> @stone-js/node-http-adapter</code> there as-is, this adapter is for the FC 2.0 HTTP
          trigger's <code>(req, resp, context)</code> model.
        </Callout>

        <H2>Generic (non-HTTP) triggers</H2>
        <p>
          For triggers that are not HTTP, an OSS object change, an MNS/queue message, a Timer or an
          EventBridge event, use the generic <code>@stone-js/alibaba-fc-adapter</code> with
          <code> @AlibabaFc()</code>. The function is invoked with <code>(event, context)</code>; the
          adapter normalizes it into an intention whose metadata carries the event payload, so one
          handler can dispatch on the trigger.
        </p>
        <Code file='app/Application.ts'>{`import { AlibabaFc } from '@stone-js/alibaba-fc-adapter'

@AlibabaFc()
@StoneApp({ name: 'workers' })
export class Application {}`}</Code>
        <p>
          On a thrown error the adapter rethrows by default so FC applies its retry / dead-letter
          policy; opt out with <code>stone.adapter.rethrowOnError = false</code>.
        </p>

        <H2>Deploy</H2>
        <p>
          Build the function output and deploy with Serverless Devs (<code>s deploy</code>) or the
          console. The per-invocation container matches the Continuum's per-event context exactly.
        </p>
        <Code file='terminal' lang='bash'>{`npm run build
s deploy   # Serverless Devs`}</Code>

        <H2>Triggers</H2>
        <PropsTable nameHeader='Package' rows={[
          { name: '@stone-js/alibaba-fc-http-adapter', type: '@AlibabaFcHttp', desc: 'HTTP-triggered functions (FC 2.0 req/resp/context). Use with @Routing.' },
          { name: '@stone-js/alibaba-fc-adapter', type: '@AlibabaFc', desc: 'Generic event triggers (OSS, MNS, Timer, EventBridge, Log).' }
        ]} />

        <Callout kind='future' title='Stack it to keep options open'>
          Add <code>@NodeHttp()</code> or <code>@Fetch()</code> alongside
          <code> @AlibabaFcHttp()</code> and the same build runs locally on Node, on the edge, and on
          Function Compute; the runtime that receives the request collapses the choice.
        </Callout>

        <SeeAlso links={[
          { title: 'Edge & Serverless context', path: '/docs/contexts/edge' },
          { title: 'Node HTTP adapter', path: '/docs/adapters/node-http' },
          { title: 'GCP Cloud Functions adapter', path: '/docs/adapters/gcp-cloud-functions' },
          { title: 'Superposition & collapse', path: '/docs/foundations/superposition' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
