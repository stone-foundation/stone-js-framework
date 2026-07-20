import { JSX } from 'react'
import { Code, CodeGroup } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/start/first-domain'

const SERVICE_DECL = `
import { Service } from '@stone-js/core'

interface Task { id: string, title: string, done: boolean }

@Service({ alias: 'tasks' })
export class TaskService {
  private readonly items = new Map<string, Task>()

  list (): Task[] { return [...this.items.values()] }

  add (title: string): Task {
    const task: Task = { id: crypto.randomUUID(), title, done: false }
    this.items.set(task.id, task)
    return task
  }
}
`

const SERVICE_IMP = `
import { defineService } from '@stone-js/core'

const TaskService = () => {
  const items = new Map()
  return {
    list: () => [...items.values()],
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
  list (): Task[] { return this.tasks.list() }

  @Post('/')
  create (event: IncomingHttpEvent): Task {
    return this.tasks.add(event.get<string>('title', 'Untitled'))
  }
}
`

const CONTROLLER_IMP = `
import { defineEventHandler, defineRoutes } from '@stone-js/router'

const TaskController = ({ tasks }) => ({
  list: () => tasks.list(),
  create: (event) => tasks.add(event.get('title', 'Untitled'))
})

export const routes = defineRoutes([
  [defineEventHandler(TaskController, 'list'),   { path: '/tasks', method: 'GET' }],
  [defineEventHandler(TaskController, 'create'), { path: '/tasks', method: 'POST' }]
])
`

/**
 * Start here: write your first domain.
 */
@Page(PATH, { layout: 'docs' })
export class FirstDomain implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Your first domain',
      description: 'Write the part that is yours, the what, with no reference to where it runs. A service and a handler are all it takes.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Start here' title='Your first domain' />
        <Lead>
          The domain is the part of your application that would still be true on any platform: its
          entities, its rules, its use cases. You write it first, and you write it without ever
          naming a server, a request object or a runtime.
        </Lead>

        <H2>A service and a handler</H2>
        <p>
          Two pieces. A <strong>service</strong> holds the logic and the state; a
          <strong> handler</strong> exposes intentions and delegates to the service. The handler
          reads values off an event and returns plain data, nothing platform-shaped.
        </p>
        <CodeGroup files={[
          { name: 'TaskService.ts', decl: SERVICE_DECL, imp: SERVICE_IMP },
          { name: 'TaskController.ts', decl: CONTROLLER_DECL, imp: CONTROLLER_IMP }
        ]} />

        <H2>What is deliberately missing</H2>
        <p>
          There is no port, no <code>listen()</code>, no request or response type, no mention of
          Node or the browser. The handler takes an intention (<code>event.get('title')</code>) and
          returns a value. Where that intention comes from, and where the value goes, is the
          context's job, added next.
        </p>
        <Aphorism>Write the what. The where comes later, and never leaks back in.</Aphorism>

        <H2>Injection, not lookup</H2>
        <p>
          The controller does not fetch its service; it receives it. <code>@Service({'{'} alias:
          'tasks' {'}'})</code> registers the service under a name, and the container hands it to the
          controller's constructor. Everything flows toward the domain, which is what keeps the
          domain unaware of everything around it.
        </p>
        <Code file='app/Tasks.ts'>{`constructor ({ tasks }: { tasks: TaskService }) {
  this.tasks = tasks   // resolved from the container by its alias
}`}</Code>

        <Callout kind='future' title='You just wrote a universal handler'>
          This class is already every context at once. The next page adds a manifest that collapses
          it onto a real runtime, and the same class will serve HTTP, run as a CLI command, or
          answer an agent, with no edit to a line you see here.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
