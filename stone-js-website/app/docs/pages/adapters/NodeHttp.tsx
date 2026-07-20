import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/adapters/node-http'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { NodeHttp } from '@stone-js/node-http-adapter'

@NodeHttp({ default: true })   // serve HTTP on Node
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
 * Adapters: Node HTTP.
 */
@Page(PATH, { layout: 'docs' })
export class NodeHttp implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Node HTTP adapter',
      description: 'Serve your domain as a production HTTP server on Node: install, enable, configure, and run.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Adapters' title='Node HTTP' />
        <Lead>
          <code>@stone-js/node-http-adapter</code> serves your domain over HTTP on a Node process. It
          is the adapter most projects start with, and the one behind <code>stone dev</code> for
          backend apps.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/node-http-adapter`}</Code>

        <H2>Enable it</H2>
        <p>
          Add the decorator (or the blueprint) to the manifest. <code>default: true</code> marks it as
          the adapter to run when several are stacked and none is selected another way.
        </p>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />
        <Code file='terminal' lang='bash'>{`npm run dev                 # local server, hot reload
curl localhost:8080/tasks   # your routes, served`}</Code>

        <H2>Configuration</H2>
        <PropsTable rows={[
          { name: 'default', type: 'boolean', default: 'false', desc: 'Run this adapter by default when several are stacked.' },
          { name: 'url / host / port', type: 'string / number', desc: 'Where the server listens (also settable via the environment).' },
          { name: 'server', type: 'object', desc: 'Underlying server options (timeouts, body limits).' }
        ]} />
        <p>
          It builds on <code>@stone-js/http-core</code>, so the request and response model, cookies,
          headers and file uploads are the runtime-agnostic ones documented in Essentials.
        </p>

        <H2>Deploy</H2>
        <p>
          Build and run the Node output behind your process manager or container. Because the domain is
          untouched by this adapter, the same code can later move to the edge or a Lambda by swapping
          the adapter, not the app.
        </p>
        <Code file='terminal' lang='bash'>{`npm run build      # produces the Node server
node dist/server.mjs`}</Code>

        <Callout kind='note' title='Stack it with the CLI'>
          Add <code>@NodeConsole()</code> alongside and the same domain answers CLI commands too, from
          one build. See the Node CLI adapter.
        </Callout>

        <SeeAlso links={[
          { title: 'Backend context', path: '/docs/contexts/backend' },
          { title: 'Node CLI', path: '/docs/adapters/node-cli' },
          { title: 'Incoming event', path: '/docs/essentials/incoming-event' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
