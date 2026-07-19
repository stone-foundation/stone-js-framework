import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Aphorism, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/adapters/fetch'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { Fetch } from '@stone-js/fetch-adapter'

@Fetch()   // any Web-standard fetch runtime
@Routing()
@StoneApp({ name: 'tasks' })
export class Application {}
`

const IMP = `
import { defineStoneApp } from '@stone-js/core'
import { routerBlueprint } from '@stone-js/router'
import { fetchAdapterBlueprint } from '@stone-js/fetch-adapter'

export const App = defineStoneApp(
  { name: 'tasks' },
  [routerBlueprint, fetchAdapterBlueprint]
)
`

/**
 * Adapters: Fetch (edge & serverless).
 */
@Page(PATH, { layout: 'docs' })
export class Fetch implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Fetch adapter',
      description: 'One Web-standard adapter for every fetch-based runtime: Cloudflare, Deno, Bun, Vercel and Netlify, from a single build.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Adapters' title='Fetch (edge & serverless)' />
        <Lead>
          <code>@stone-js/fetch-adapter</code> is built on the Web platform's <code>Request</code> and
          <code> Response</code> (WinterCG), so one adapter serves every fetch-based runtime. Instead of
          a package per platform, you ship the same build to all of them.
        </Lead>

        <H2>Install & enable</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/fetch-adapter`}</Code>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />
        <Aphorism>The runtimes standardised on Request and Response. One adapter speaks it; every one of them is a deploy target.</Aphorism>

        <H2>Targets</H2>
        <PropsTable nameHeader='Runtime' rows={[
          { name: 'Cloudflare Workers', type: 'edge', desc: 'Deploy the fetch handler as a Worker.' },
          { name: 'Deno / Deno Deploy', type: 'edge / server', desc: 'Runs on Deno’s Web-standard runtime.' },
          { name: 'Bun', type: 'server', desc: 'Bun’s fetch server.' },
          { name: 'Vercel', type: 'serverless / edge', desc: 'Edge or serverless functions.' },
          { name: 'Netlify', type: 'serverless / edge', desc: 'Edge or serverless functions.' }
        ]} />

        <H2>Deploy</H2>
        <p>
          Build once and deploy the output to any target with that platform's tooling. The handlers are
          byte-for-byte identical across all of them; only the deployment command differs.
        </p>
        <Code file='terminal' lang='bash'>{`npm run build
# then, per platform, e.g.:
wrangler deploy            # Cloudflare
vercel deploy              # Vercel
netlify deploy             # Netlify`}</Code>

        <Callout kind='future' title='The payoff of deferred collapse'>
          Because the domain never named a platform, moving from a Worker to Deno to Vercel is a
          deployment choice, taken long after the code was written, and reversible. Stack the fetch and
          Lambda adapters and even that choice waits until a cause arrives at runtime.
        </Callout>

        <SeeAlso links={[
          { title: 'Edge & Serverless context', path: '/docs/contexts/edge' },
          { title: 'AWS Lambda', path: '/docs/adapters/aws-lambda' },
          { title: 'The ephemeral context', path: '/docs/foundations/ephemeral-context' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
