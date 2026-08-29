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
          { name: 'url', type: 'string', default: 'http://localhost:8080', desc: 'Where the server listens. Left at the default, HOST and PORT from the environment are honoured.' },
          { name: 'server', type: 'object', desc: 'Underlying server options (timeouts, body limits).' },
          { name: 'shutdownGracePeriod', type: 'number', default: '10000', desc: 'How long requests in flight have to finish on SIGINT/SIGTERM before the process exits anyway.' }
        ]} />
        <Callout kind='note' title='A graceful shutdown that actually ends'>
          On <code>SIGINT</code> or <code>SIGTERM</code> the server stops accepting, runs your
          <code> onStop</code> hooks, and closes idle keep-alive connections at once, because a socket
          sitting idle has no request to wait for and would otherwise hold the process open forever.
          Requests in flight get the grace period, then the process exits regardless. That upper bound
          is what makes a rolling restart predictable: your orchestrator never has to hard-kill a
          container that promised to leave.
        </Callout>
        <p>
          It builds on <code>@stone-js/http-core</code>, so the request and response model, cookies,
          headers and file uploads are the runtime-agnostic ones documented in Essentials.
        </p>

        <H2>Where it listens</H2>
        <p>
          Three rules, in this order. A <code>url</code> you declared always wins, because an
          application that pinned one said what it meant. Left at the default, <code>HOST</code> and{' '}
          <code>PORT</code> from the environment are honoured, which is how Cloud Run, Heroku, Render,
          Fly, App Runner and Railway tell a process where to listen. And when the port comes from the
          environment without a <code>HOST</code>, the server binds <strong>every interface</strong>{' '}
          rather than loopback.
        </p>
        <Callout kind='note' title='Why the port implies the interface'>
          A platform that assigns the port is going to reach the process from outside its container,
          and loopback answers nobody there. Locally, where nothing assigns a port, the default stays
          loopback: <code>stone dev</code> does not put a development server on your network without
          being asked, and the startup banner prints the network address only when that address can
          actually answer.
        </Callout>

        <H2>Deploy</H2>
        <p>
          Build and run the Node output behind your process manager or container. Because the domain is
          untouched by this adapter, the same code can later move to the edge or a Lambda by swapping
          the adapter, not the app.
        </p>
        <Code file='terminal' lang='bash'>{`npm run build      # produces the Node server
node dist/server.mjs`}</Code>
        <p>
          A minimal production container: multi-stage so only the runtime and pruned dependencies ship.
        </p>
        <Code file='Dockerfile' lang='docker'>{`# --- build stage ---
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build                       # -> dist/server.mjs

# --- runtime stage ---
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
# Tells the server which port to listen on, and with it to bind every interface rather than
# loopback, which nothing outside the container can reach. A platform that injects its own PORT
# overrides this one.
ENV PORT=8080
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["node", "dist/server.mjs"]`}</Code>

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
