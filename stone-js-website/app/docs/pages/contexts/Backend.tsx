import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/contexts/backend'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { NodeHttp } from '@stone-js/node-http-adapter'
import { NodeConsole } from '@stone-js/node-cli-adapter'

@NodeHttp()      // serve the domain over HTTP on Node
@NodeConsole()   // ...and expose the same domain as CLI commands
@Routing()
@StoneApp()
export class Application {}
`

const IMP = `
import { defineStoneApp } from '@stone-js/core'
import { routerBlueprint } from '@stone-js/router'
import { nodeHttpAdapterBlueprint } from '@stone-js/node-http-adapter'
import { nodeConsoleAdapterBlueprint } from '@stone-js/node-cli-adapter'

export const App = defineStoneApp(
  { name: 'tasks' },
  [routerBlueprint, nodeHttpAdapterBlueprint, nodeConsoleAdapterBlueprint]
)
`

/**
 * Contexts: the backend (Node HTTP + CLI).
 */
@Page(PATH, { layout: 'docs' })
export class Backend implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Backend',
      description: 'Run the same Tasks domain as an HTTP service on Node and as CLI commands, with no change to the domain.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Contexts' title='Backend' />
        <Lead>
          The backend is the context most frameworks are built around, so it is the easiest place
          to feel what Stone.js does differently: the server is not the foundation of your app,
          it is one context your domain can collapse into.
        </Lead>

        <H2>The same domain</H2>
        <p>
          Here is the Tasks handler again, unchanged. It names no server, no request object, no
          port. It reads intentions from an event and returns values.
        </p>
        <Code file='app/Tasks.ts'>{`import { Service, RuntimeError } from '@stone-js/core'
import { IncomingHttpEvent } from '@stone-js/http-core'
import { Get, Post, Delete, EventHandler } from '@stone-js/router'

@Service({ alias: 'tasks' })
export class TaskService {
  private readonly items = new Map<string, Task>()

  list (done?: boolean): Task[] {
    const all = [...this.items.values()]
    return done === undefined ? all : all.filter((t) => t.done === done)
  }

  find (id: string): Task | undefined { return this.items.get(id) }

  add (title: string): Task {
    const task: Task = { id: crypto.randomUUID(), title, done: false }
    this.items.set(task.id, task)
    return task
  }
}

@EventHandler('/tasks')
export class TaskController {
  private readonly tasks: TaskService
  constructor ({ tasks }: { tasks: TaskService }) { this.tasks = tasks }

  @Get('/')
  list (event: IncomingHttpEvent): Task[] {
    return this.tasks.list(event.get<boolean>('done'))
  }

  @Get('/:id')
  show (event: IncomingHttpEvent): Task {
    const task = this.tasks.find(event.get<string>('id'))
    if (task === undefined) throw new RuntimeError('Task not found')
    return task
  }

  @Post('/')
  create (event: IncomingHttpEvent): Task {
    return this.tasks.add(event.get<string>('title'))
  }
}`}</Code>

        <H2>Collapse it onto Node</H2>
        <p>
          Only the manifest changes per context. Add the Node HTTP adapter and you have a real
          HTTP service. Add the CLI adapter alongside it and the very same domain answers to
          commands too. Neither adapter touches <code>Tasks</code>.
        </p>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />
        <Code file='terminal' lang='bash'>{`npm run dev
# HTTP:
curl localhost:8080/tasks
# CLI (same domain, different cause):
node app tasks:list`}</Code>

        <Aphorism>The server did not define the app. The app accepted the server.</Aphorism>

        <H2>What the backend context gives you</H2>
        <ul>
          <li><strong>node-http-adapter</strong>: a production HTTP server, streaming, cookies, static files.</li>
          <li><strong>node-cli-adapter</strong>: the same handlers, invoked as commands, for jobs and tooling.</li>
          <li><strong>http-core</strong>: the runtime-agnostic HTTP layer both share, so semantics stay identical.</li>
        </ul>

        <Callout kind='note' title='http-core is not Node-specific'>
          The HTTP request and response model lives in <code>@stone-js/http-core</code>, with no
          Node vocabulary. That is why the edge and serverless contexts can reuse the exact same
          handlers: HTTP is a shared layer, not a backend detail.
        </Callout>

        <Callout kind='future' title='One deployment, two causes'>
          Because adapters stack, a single build can serve HTTP and answer CLI commands at once.
          The domain is resolved by whichever cause arrives. You are already doing superposition,
          on your own laptop.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
