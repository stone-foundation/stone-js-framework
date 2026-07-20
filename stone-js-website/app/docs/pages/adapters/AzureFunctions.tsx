import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/adapters/azure-functions'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { AzureFunctionsHttp } from '@stone-js/azure-functions-http-adapter'

@AzureFunctionsHttp()   // Azure Functions v4 HTTP trigger
@Routing()
@StoneApp({ name: 'tasks' })
export class Application {}
`

const IMP = `
import { defineStoneApp } from '@stone-js/core'
import { routerBlueprint } from '@stone-js/router'
import { azureFunctionsHttpAdapterBlueprint } from '@stone-js/azure-functions-http-adapter'

export const App = defineStoneApp(
  { name: 'tasks' },
  [routerBlueprint, azureFunctionsHttpAdapterBlueprint]
)
`

/**
 * Adapters: Azure Functions (HTTP).
 */
@Page(PATH, { layout: 'docs' })
export class AzureFunctions implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Azure Functions adapter',
      description: 'Run your domain on Azure Functions v4 HTTP triggers, unchanged. Azure v4 is Web-standard (HttpRequest → HttpResponseInit), so the adapter maps it straight to an intention and back.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Adapters' title='Azure Functions' />
        <Lead>
          Azure Functions v4 invokes an HTTP-triggered function with a Web-standard
          <code> HttpRequest</code> and expects an <code>HttpResponseInit</code> back.
          <code> @stone-js/azure-functions-http-adapter</code> maps that request to an intention, runs
          your kernel, and builds the response object the host writes, so your routes run on Azure
          Functions unchanged.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/azure-functions-http-adapter`}</Code>

        <H2>Enable it</H2>
        <p>
          Add the decorator (or the blueprint) to the manifest. Because Azure v4 is Web-standard, the
          request normalization is the same one the Fetch adapter uses; only the response differs (an
          <code> HttpResponseInit</code> object rather than a <code>Response</code>).
        </p>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H3>Register the handler</H3>
        <p>
          <code>run()</code> returns the handler you register with <code>@azure/functions</code>. Use a
          catch-all route so the universal router owns matching.
        </p>
        <Code file='src/functions/stone.ts'>{`import { app } from '@azure/functions'

app.http('stone', {
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  authLevel: 'anonymous',
  route: '{*path}',
  handler: await stoneApp.run()
})`}</Code>

        <Callout kind='note' title='HTTP triggers, this adapter; other triggers, coming'>
          This adapter targets the HTTP trigger. A generic adapter for Azure's non-HTTP triggers
          (Queue Storage, Timer, Blob, Service Bus) will follow, exactly like the AWS and GCP split.
        </Callout>

        <H2>Deploy</H2>
        <p>
          Build the function output and deploy with the Azure Functions Core Tools or your IaC of
          choice. The per-invocation model matches the Continuum's per-event context exactly.
        </p>
        <Code file='terminal' lang='bash'>{`npm run build
func azure functionapp publish <your-app-name>`}</Code>

        <H2>Which adapter</H2>
        <PropsTable nameHeader='Package' rows={[
          { name: '@stone-js/azure-functions-http-adapter', type: '@AzureFunctionsHttp', desc: 'HTTP-triggered functions (v4 HttpRequest → HttpResponseInit). Use with @Routing.' },
          { name: '@stone-js/fetch-adapter', type: '@Fetch', desc: 'The Web-standard sibling for edge/WinterCG runtimes (Cloudflare, Deno, Bun, Vercel/Netlify Edge).' }
        ]} />

        <Callout kind='future' title='Stack it to keep options open'>
          Add <code>@NodeHttp()</code> or <code>@Fetch()</code> alongside
          <code> @AzureFunctionsHttp()</code> and the same build runs locally on Node, on the edge, and
          on Azure Functions; the runtime that receives the request collapses the choice.
        </Callout>

        <SeeAlso links={[
          { title: 'Edge & Serverless context', path: '/docs/contexts/edge' },
          { title: 'Fetch adapter', path: '/docs/adapters/fetch' },
          { title: 'GCP Cloud Functions adapter', path: '/docs/adapters/gcp-cloud-functions' },
          { title: 'Superposition & collapse', path: '/docs/foundations/superposition' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
