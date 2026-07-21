import { JSX } from 'react'
import { Code } from '../../docs/components/Code'
import { Diagram } from '../components/Diagram'
import { ArticleLayout, articleHead } from '../ArticleLayout'
import { HeadContext, IPage, Page, ReactIncomingEvent, StoneLink } from '@stone-js/use-react'

const SLUG = 'one-domain-three-runtimes'

/**
 * Blog: One domain, three runtimes (the differentiator recipe).
 */
@Page(`/blog/${SLUG}`, { layout: 'site' })
export class OneDomainThreeRuntimes implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return articleHead(SLUG)
  }

  render (): JSX.Element {
    return (
      <ArticleLayout slug={SLUG}>
        <p className='doc-lead'>
          Here is a claim most frameworks cannot make and Stone.js can: take one codebase, unchanged,
          and run it on a Node server, on AWS Lambda, and on the edge (Cloudflare, Deno, Bun, Vercel,
          Netlify). Not three builds of three apps. One domain, three runtimes.
        </p>

        <h2>The problem with "just deploy it elsewhere"</h2>
        <p>
          Moving a conventional app to a new runtime is rarely a deploy; it is a rework. The framework
          assumed a Node server, or a specific handler signature, or a bundler target, and that
          assumption is threaded through the code. Serverless cold starts, edge runtimes with Web APIs
          instead of Node APIs, a different request object, each one leaks into your logic.
        </p>
        <p>
          The cost is lock-in: the runtime you picked on day one is the runtime you are married to, and
          re-platforming for cost, latency or reach means touching the domain.
        </p>

        <h2>Stone.js keeps the runtime out of the domain</h2>
        <p>
          Your domain never names a runtime. You declare the runtimes you want to support as
          <strong> adapters</strong> in the manifest, stacked together, and they coexist. Nothing is
          selected until the app runs, when Stone.js resolves exactly one, the contextual collapse.
        </p>

        <Diagram
          layout='hub'
          height={420}
          caption='One codebase at the centre. At run time the collapse picks the target’s adapter, so the same domain is served on Node, Lambda, the edge or the browser, unchanged.'
          nodes={[
            { label: 'Your domain', sub: 'written once', kind: 'core' },
            { label: 'Node', sub: 'node-http-adapter', kind: 'context' },
            { label: 'AWS Lambda', sub: 'aws-lambda-adapter', kind: 'context' },
            { label: 'Edge', sub: 'fetch-adapter', kind: 'context' },
            { label: 'Browser', sub: 'browser-adapter', kind: 'context' }
          ]}
        />

        <h2>The manifest, and only the manifest, changes</h2>
        <p>
          Stack the adapters. That is the whole of it: the handlers below are untouched, and there is
          no runtime-specific branch anywhere in your code.
        </p>
        <Code file='app/Application.ts'>{`import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { NodeHttp } from '@stone-js/node-http-adapter'
import { AwsLambdaHttp } from '@stone-js/aws-lambda-http-adapter'
import { Fetch } from '@stone-js/fetch-adapter'

@Routing()
@NodeHttp({ default: true })   // local dev and Node servers
@AwsLambdaHttp()               // AWS Lambda
@Fetch()                       // Cloudflare, Deno, Bun, Vercel, Netlify (Web standard)
@StoneApp({ name: 'tasks' })
export class Application {}`}</Code>
        <p>
          The same <code>TaskController</code> you would write for a plain Node app answers on all
          three. When the process starts, Stone.js picks the adapter whose platform it is running on
          (or the one marked <code>default</code>): started on Node it collapses to <code>NodeHttp</code>;
          on Lambda, to <code>AwsLambdaHttp</code>; on an edge runtime, the Web-standard
          <code> Fetch</code> handler serves it.
        </p>

        <h2>Deploy the same artifact, everywhere</h2>
        <p>
          You build once. The output runs as a Node server, is handed to Lambda as its handler, or is
          served through a Web <code>fetch</code> entry on the edge, the edge adapter ships the
          <code> serveCloudflare</code>, <code>serveDeno</code>, <code>serveBun</code>,
          <code> serveVercel</code> and <code>serveNetlify</code> helpers for exactly that. No fork, no
          per-target branch, no second codebase to keep in sync.
        </p>

        <h2>Why enterprises care</h2>
        <ul>
          <li><strong>No lock-in.</strong> Re-platform for cost or latency without touching the domain.</li>
          <li><strong>One team, one codebase.</strong> The same app serves every environment; there is nothing to keep in sync.</li>
          <li><strong>Future runtimes are a package, not a rewrite.</strong> The next platform arrives as an adapter someone writes.</li>
        </ul>

        <h2>Run it</h2>
        <p>
          The <StoneLink to='/starters'>Continuum Showcase</StoneLink> starter is exactly this: one
          domain, served over HTTP, on the edge, as a CLI and as agent tools, with both paradigms side
          by side. Scaffold it, then read <StoneLink to='/docs/foundations/adapters'>Adapters</StoneLink>
          and <StoneLink to='/docs/foundations/superposition'>Superposition and collapse</StoneLink> for
          the mechanics.
        </p>
      </ArticleLayout>
    )
  }
}
