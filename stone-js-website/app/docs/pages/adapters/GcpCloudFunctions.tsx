import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/adapters/gcp-cloud-functions'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { GcpCloudFunctionsHttp } from '@stone-js/gcp-cloud-functions-http-adapter'

@GcpCloudFunctionsHttp()   // Cloud Functions HTTP trigger
@Routing()
@StoneApp({ name: 'tasks' })
export class Application {}
`

const IMP = `
import { defineStoneApp } from '@stone-js/core'
import { routerBlueprint } from '@stone-js/router'
import { gcpCloudFunctionsHttpAdapterBlueprint } from '@stone-js/gcp-cloud-functions-http-adapter'

export const App = defineStoneApp(
  { name: 'tasks' },
  [routerBlueprint, gcpCloudFunctionsHttpAdapterBlueprint]
)
`

/**
 * Adapters: GCP Cloud Functions (HTTP).
 */
@Page(PATH, { layout: 'docs' })
export class GcpCloudFunctions implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'GCP Cloud Functions adapter',
      description: 'Run your domain on Google Cloud Functions: an HTTP adapter for HTTP triggers, and a generic adapter for CloudEvents (Pub/Sub, Storage, Eventarc).'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Adapters' title='GCP Cloud Functions' />
        <Lead>
          Google Cloud Functions invokes an HTTP function with the Functions Framework's
          Express-flavoured <code>(req, res)</code> signature. <code>@stone-js/gcp-cloud-functions-http-adapter</code>
          maps that call to an intention, runs your kernel, and writes the response back, so your
          routes run on Cloud Functions unchanged.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/gcp-cloud-functions-http-adapter`}</Code>

        <H2>Enable it</H2>
        <p>
          Add the decorator (or the blueprint) to the manifest. Your routes, validation, cookies and
          file uploads are the runtime-agnostic ones from <code>@stone-js/http-core</code>; nothing in
          the domain changes.
        </p>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H3>Bodies come pre-parsed</H3>
        <p>
          The Functions Framework consumes the request stream before your handler runs and hands it the
          already-parsed <code>body</code> and the untouched <code>rawBody</code>. The adapter reads
          both, so JSON, form and text bodies work with zero configuration, and the raw payload stays
          available on the event metadata for webhook signature checks.
        </p>

        <Callout kind='note' title='Cloud Run needs no adapter'>
          Cloud Run runs a container with an ordinary long-running HTTP server. Use
          <code> @stone-js/node-http-adapter</code> there as-is, this adapter is specifically for the
          event-driven Cloud Functions runtime (1st and 2nd gen).
        </Callout>

        <H2>Deploy</H2>
        <p>
          Build the function output and deploy the HTTP trigger. The generated entry registers the
          handler with the Functions Framework under the target name you deploy against.
        </p>
        <Code file='terminal' lang='bash'>{`npm run build    # produces the Cloud Functions entry
gcloud functions deploy tasks \\
  --gen2 --runtime=nodejs20 \\
  --trigger-http --entry-point=stone --allow-unauthenticated`}</Code>
        <p>
          The ephemeral per-invocation container matches the Continuum's per-event model exactly: the
          context is created for the request and collapses after it.
        </p>

        <H2>Generic (non-HTTP) triggers</H2>
        <p>
          For events that are not HTTP, a Pub/Sub message, a Cloud Storage change, an Eventarc or
          scheduler event, use the generic <code>@stone-js/gcp-cloud-functions-adapter</code> with
          <code> @GcpCloudFunctions()</code>. Every 2nd-gen trigger arrives as a CloudEvent; the adapter
          normalizes it into an intention whose metadata carries the event's <code>type</code>,
          <code> source</code>, <code>subject</code> and <code>data</code>, so one handler can dispatch
          on the event type.
        </p>
        <Code file='app/Application.ts'>{`import { GcpCloudFunctions } from '@stone-js/gcp-cloud-functions-adapter'

@GcpCloudFunctions()
@StoneApp({ name: 'workers' })
export class Application {}`}</Code>
        <p>
          Register the returned handler with <code>functions.cloudEvent(...)</code> and deploy against
          the trigger, e.g. <code>--trigger-topic</code> for Pub/Sub. On a thrown error the adapter
          rethrows by default so Cloud Functions applies its retry policy; opt out with
          <code> stone.adapter.rethrowOnError = false</code>.
        </p>

        <H2>Triggers</H2>
        <PropsTable nameHeader='Package' rows={[
          { name: '@stone-js/gcp-cloud-functions-http-adapter', type: '@GcpCloudFunctionsHttp', desc: 'HTTP-triggered functions (Functions Framework req/res). Use with @Routing.' },
          { name: '@stone-js/gcp-cloud-functions-adapter', type: '@GcpCloudFunctions', desc: 'Generic CloudEvents triggers (Pub/Sub, Cloud Storage, Eventarc, schedulers).' }
        ]} />

        <Callout kind='future' title='Stack it to keep options open'>
          Add <code>@NodeHttp()</code> or <code>@Fetch()</code> alongside
          <code> @GcpCloudFunctionsHttp()</code> and the same build runs locally on Node, on the edge,
          and on Cloud Functions; the runtime that receives the request collapses the choice.
        </Callout>

        <SeeAlso links={[
          { title: 'Edge & Serverless context', path: '/docs/contexts/edge' },
          { title: 'Node HTTP adapter', path: '/docs/adapters/node-http' },
          { title: 'AWS Lambda adapter', path: '/docs/adapters/aws-lambda' },
          { title: 'Superposition & collapse', path: '/docs/foundations/superposition' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
