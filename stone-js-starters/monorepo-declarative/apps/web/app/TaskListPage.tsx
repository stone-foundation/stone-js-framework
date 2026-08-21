import { JSX } from 'react'
import { Promiseable } from '@stone-js/core'
import { Task, TaskService } from '@acme/domain'
import { HeadContext, IPage, Page, PageHeadContext, PageRenderContext, ReactIncomingEvent } from '@stone-js/use-react'

/**
 * The task list, as a web page.
 *
 * Read `handle` and `head` next to `apps/mobile/app/TaskListScreen.tsx`: they are the same, line for
 * line, because answering a route is not a platform question. Only `render` differs, and only because
 * a browser draws with `div` and a phone draws with `View`.
 */
@Page('/')
export class TaskListPage implements IPage<ReactIncomingEvent> {
  private readonly tasks: TaskService

  /**
   * @param tasks - The shared domain service, under the alias its blueprint registered.
   */
  constructor ({ tasks }: { tasks: TaskService }) {
    this.tasks = tasks
  }

  /**
   * Answer the route.
   *
   * @param event - The incoming event.
   * @returns The page's data.
   */
  handle (event: ReactIncomingEvent): TaskListData {
    const toggle = event.get<string>('toggle')

    if (toggle !== undefined) { this.tasks.toggle(toggle) }

    return { tasks: this.tasks.all(), remaining: this.tasks.remaining() }
  }

  /**
   * Name the page.
   *
   * @returns The head context.
   */
  head ({ data }: PageHeadContext<TaskListData>): Promiseable<HeadContext> {
    return {
      title: `${data?.remaining ?? 0} left · Acme tasks`,
      description: 'One domain, two applications. This is the web one.'
    }
  }

  /**
   * Draw the page.
   *
   * @returns The rendered page.
   */
  render ({ data }: PageRenderContext<TaskListData>): JSX.Element {
    return (
      <main className='stone-welcome'>
        <div className='glow' aria-hidden='true' />
        <section className='hero'>
          <img className='mark' src='/logo.svg' alt='Stone.js' width={104} height={104} />
          <p className='eyebrow'>ONE DOMAIN, TWO APPS</p>
          <h1 className='title'>Acme tasks</h1>
          <p className='lead'>{data?.remaining} left to do</p>

          <ul className='tasks'>
            {data?.tasks.map((task) => (
              <li key={task.id} className={task.done ? 'task done' : 'task'}>
                <a href={`/?toggle=${task.id}`}>
                  <span className='box' aria-hidden='true'>{task.done ? '●' : '○'}</span>
                  {task.title}
                </a>
              </li>
            ))}
          </ul>

          <nav className='links'>
            <a href='https://stonejs.dev/docs' target='_blank' rel='noreferrer noopener'>Documentation</a>
            <span className='edit'>Edit <b>apps/web/app/TaskListPage.tsx</b></span>
          </nav>
        </section>
        <footer className='brand'>
          <span className='dot'>●</span> the same <b>@acme/domain</b> runs the mobile app
        </footer>
      </main>
    )
  }
}

/**
 * What the page hands to its renderer.
 */
export interface TaskListData {
  tasks: Task[]
  remaining: number
}
