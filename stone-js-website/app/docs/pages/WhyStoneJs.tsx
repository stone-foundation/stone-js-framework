import { JSX } from 'react'
import { CodeTabs } from '../components/Code'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Aphorism, Pager } from '../components/content'
import { siblings } from '../nav'

const PATH = '/docs'

const DECL = `
import { Get, EventHandler } from '@stone-js/router'

@EventHandler('/tasks')
export class Tasks {
  constructor ({ store }) { this.store = store }

  @Get('/')
  list () { return this.store.all() }
}
`

const IMP = `
import { defineEventHandler, defineRoutes } from '@stone-js/router'

const Tasks = ({ store }) => ({ list: () => store.all() })

export const routes = defineRoutes([
  [defineEventHandler(Tasks, 'list'), { path: '/tasks', method: 'GET' }]
])
`

/**
 * Start here: the thesis, in three minutes.
 */
@Page(PATH, { layout: 'docs' })
export class WhyStoneJs implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Why Stone.js',
      description: 'A framework that is the context. Write your domain once; it runs on server, edge, browser and agents, and collapses into one at deploy.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Start here' title='Why Stone.js' />
        <Lead>
          Most frameworks make you choose a runtime first: a server framework, an edge framework,
          a frontend framework. You wire your logic to that choice, and the day the runtime changes,
          you rewrite. Stone.js inverts the order. You write the domain. The context comes to it.
        </Lead>

        <H2>The claim</H2>
        <p>
          An application is not an object you build for one place. It is an act:
          a domain, meeting a context, resolving into a response. Stone.js is the context.
          You keep the part that is yours, the <em>what</em>, and defer the part that is the
          platform's, the <em>where</em>, until the last responsible moment: deployment.
        </p>
        <Aphorism cite='The Continuum Architecture'>
          Application = Domain × Context → Resolution
        </Aphorism>

        <H2>The same domain, everywhere</H2>
        <p>
          Keep an eye on this handler; it comes back a lot. Written once, it serves an HTTP API on
          Node; the exact same class ships to a Lambda, to a Cloudflare Worker, or becomes a tool
          an AI agent can call. Nothing below the domain leaks into it.
        </p>
        <CodeTabs
          file='app/Tasks.ts'
          decl={DECL}
          imp={IMP}
        />
        <p>
          Two ways to write it, declarative and imperative, at strict parity. Pick one with the
          switch in the header; every example on the site follows your choice.
        </p>

        <Callout kind='future' title='What you are about to unlearn'>
          The runtime is not a foundation you pour before building. It is a value, chosen late,
          that the framework resolves for you. Once you have felt that, picking a server before
          writing a line of logic will feel like guessing.
        </Callout>

        <H2>Where this goes next</H2>
        <p>
          Foundations is the architecture itself, the part that holds no matter where the code runs.
          Contexts follows the same domain as it collapses into backend, frontend, edge and agents.
          Build has the recipes for real applications. Frontier is where the model goes from here.
        </p>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
