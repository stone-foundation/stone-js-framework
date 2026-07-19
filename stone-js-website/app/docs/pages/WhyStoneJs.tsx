import { JSX } from 'react'
import { CodeGroup } from '../components/Code'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Aphorism, Define, Pager } from '../components/content'
import { siblings } from '../nav'

const PATH = '/docs'

const SERVICE_DECL = `
import { Service } from '@stone-js/core'

interface Task { id: string, title: string, done: boolean }

// A service, injected by its alias. Pure domain: no HTTP, no platform.
@Service({ alias: 'tasks' })
export class TaskService {
  private readonly items = new Map<string, Task>()

  list (done?: boolean): Task[] {
    const all = [...this.items.values()]
    return done === undefined ? all : all.filter((t) => t.done === done)
  }

  add (title: string): Task {
    const task: Task = { id: crypto.randomUUID(), title, done: false }
    this.items.set(task.id, task)
    return task
  }
}
`

const SERVICE_IMP = `
import { defineService } from '@stone-js/core'

// A factory service, bound to the alias 'tasks'.
const TaskService = () => {
  const items = new Map()
  return {
    list: (done) => [...items.values()].filter((t) => done === undefined || t.done === done),
    add: (title) => {
      const task = { id: crypto.randomUUID(), title, done: false }
      items.set(task.id, task)
      return task
    }
  }
}

export const services = [defineService(TaskService, { alias: 'tasks' }, true)]
`

const CONTROLLER_DECL = `
import { IncomingHttpEvent } from '@stone-js/http-core'
import { Get, Post, EventHandler } from '@stone-js/router'

@EventHandler('/tasks')
export class TaskController {
  private readonly tasks: TaskService
  constructor ({ tasks }: { tasks: TaskService }) { this.tasks = tasks }

  @Get('/')
  list (event: IncomingHttpEvent): Task[] {
    return this.tasks.list(event.get<boolean>('done'))
  }

  @Post('/')
  create (event: IncomingHttpEvent): Task {
    return this.tasks.add(event.get<string>('title', 'Untitled'))
  }
}
`

const CONTROLLER_IMP = `
import { defineEventHandler, defineRoutes } from '@stone-js/router'

// A factory handler: the container hands it the resolved 'tasks' service.
const TaskController = ({ tasks }) => ({
  list: (event) => tasks.list(event.get('done')),
  create: (event) => tasks.add(event.get('title', 'Untitled'))
})

export const routes = defineRoutes([
  [defineEventHandler(TaskController, 'list'),   { path: '/tasks', method: 'GET' }],
  [defineEventHandler(TaskController, 'create'), { path: '/tasks', method: 'POST' }]
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

        <p>
          Two words carry this whole site, so let us pin them down before going further, in the
          plainest terms, with an everyday example.
        </p>
        <Define term='Domain'>
          <p>What your app <em>means</em>: its data and its rules, independent of where it runs.</p>
          <p>
            <strong>Everyday example.</strong> In a to-do app, "a task has a title and can be marked
            done" is the domain. It is true whether the app runs on a server, on a phone, or nowhere
            at all yet. It is the part that is <em>yours</em>.
          </p>
        </Define>
        <Define term='Context'>
          <p>Everything your app does <em>not</em> control: the runtime, the protocol, the shape of
            the input and output. The part the platform decides.</p>
          <p>
            <strong>Everyday example.</strong> The same to-do task might be created by an
            <code> HTTP POST</code> on a Node server, by a tap in a mobile app, or by an AI agent
            calling a tool. Different contexts, one domain. Stone.js supplies the context so you do
            not have to.
          </p>
        </Define>

        <H2>The same domain, everywhere</H2>
        <p>
          Keep an eye on this handler; it comes back a lot. Written once, it serves an HTTP API on
          Node; the exact same class ships to a Lambda, to a Cloudflare Worker, or becomes a tool
          an AI agent can call. Nothing below the domain leaks into it.
        </p>
        <CodeGroup files={[
          { name: 'TaskService.ts', decl: SERVICE_DECL, imp: SERVICE_IMP },
          { name: 'TaskController.ts', decl: CONTROLLER_DECL, imp: CONTROLLER_IMP }
        ]} />
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
