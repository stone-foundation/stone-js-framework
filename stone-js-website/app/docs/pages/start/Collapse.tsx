import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/start/collapse'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { NodeHttp } from '@stone-js/node-http-adapter'

@NodeHttp()   // the context: serve the domain over HTTP on Node
@Routing()
@StoneApp({ name: 'tasks' })
export class Application {}
`

const IMP = `
import { defineStoneApp } from '@stone-js/core'
import { routerBlueprint } from '@stone-js/router'
import { nodeHttpAdapterBlueprint } from '@stone-js/node-http-adapter'

export const App = defineStoneApp(
  { name: 'tasks' },
  [routerBlueprint, nodeHttpAdapterBlueprint]
)
`

/**
 * Start here: collapse the domain onto a context.
 */
@Page(PATH, { layout: 'docs' })
export class Collapse implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Collapse it',
      description: 'Choose where the domain runs by adding an adapter to the manifest, not by rewriting a line of the domain.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Start here' title='Collapse it' />
        <Lead>
          The domain from the previous page runs nowhere yet: it is pure potential. Choosing where
          it runs is a single, separate act, adding an adapter to the application manifest. The
          manifest is the only file that knows about platforms.
        </Lead>

        <H2>The manifest names the context</H2>
        <p>
          <code>Application.ts</code> is the manifest. Add the Node HTTP adapter and the Tasks
          domain becomes a running HTTP service. Notice that <code>Tasks.ts</code> is not touched
          and not even imported here: the adapter finds your handlers through the Blueprint.
        </p>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />
        <Code file='terminal' lang='bash'>{`npm run dev
curl localhost:8080/tasks           # []  (empty list)
curl -X POST localhost:8080/tasks -d 'title=Ship it'
curl localhost:8080/tasks           # [{ "id": "...", "title": "Ship it", "done": false }]`}</Code>

        <H2>Change the where, keep the what</H2>
        <p>
          To run the same domain somewhere else, you change the adapter, not the domain. Swap
          <code> @NodeHttp()</code> for <code>@Fetch()</code> and it deploys to Cloudflare, Deno,
          Bun, Vercel or Netlify. Swap it for <code>@AwsLambdaHttp()</code> and it is a Lambda. The
          handler and service stay byte-for-byte identical.
        </p>
        <Aphorism>The runtime is a value you set in the manifest, not a foundation you pour under the code.</Aphorism>

        <H2>Your app exists in every runtime. Until you run it.</H2>
        <p>
          <code>npm run build</code> emits a single self-contained artifact in <code>dist/</code>,
          with no <code>node_modules</code> to carry. That one artifact drops onto any JavaScript
          runtime; the adapter you chose decides which shape it takes.
        </p>
        <ul>
          <li><strong>Node servers</strong> and <strong>Docker</strong> containers.</li>
          <li><strong>Serverless</strong>: AWS Lambda, Azure Functions, and the like.</li>
          <li><strong>Edge</strong>: Cloudflare Workers, Vercel Edge, Deno Deploy, Bun.</li>
          <li><strong>Static hosts / CDNs</strong> for frontend (CSR/SSG) builds.</li>
        </ul>

        <Callout kind='note' title='Running is the measurement'>
          Adding an adapter does not collapse anything; it adds a possible context. The collapse
          happens when the app <em>runs</em>: at run time Stone.js resolves which adapter answers the
          cause. Deployment only decides where the artifact lives; running it, locally or in
          production, is the observation, and you just performed it with <code>npm run dev</code>.
        </Callout>

        <Callout kind='future' title='You can stack them'>
          Nothing forces a single adapter. Add several and the domain stays superposed across all of
          them until, at runtime, a real cause selects one. That is the subject of Foundations, next.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
