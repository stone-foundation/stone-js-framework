import { JSX } from 'react'
import { Promiseable } from '@stone-js/core'
import { TaskListView } from './TaskListView'
import { Task, TaskService } from '@acme/domain'
import { HeadContext, IPage, Page, PageHeadContext, PageRenderContext, ReactIncomingEvent } from '@stone-js/use-react-native'

/**
 * The task list, as a native screen.
 *
 * Read `handle` and `head` next to `apps/web/app/TaskListPage.tsx`: they are the same, line for line,
 * because answering a route is not a platform question. Only `render` differs, and only because a
 * browser draws with `div` and a phone draws with `View`.
 */
@Page('/')
export class TaskListScreen implements IPage<ReactIncomingEvent> {
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
   * @returns The screen's data.
   */
  handle (event: ReactIncomingEvent): TaskListData {
    const toggle = event.get<string>('toggle')

    if (toggle !== undefined) { this.tasks.toggle(toggle) }

    return { tasks: this.tasks.all(), remaining: this.tasks.remaining() }
  }

  /**
   * Name the screen.
   *
   * @returns The head context.
   */
  head ({ data }: PageHeadContext<TaskListData>): Promiseable<HeadContext> {
    return {
      title: `${data?.remaining ?? 0} left · Acme tasks`,
      description: 'One domain, two applications. This is the native one.'
    }
  }

  /**
   * Draw the screen.
   *
   * @returns The rendered screen.
   */
  render ({ data }: PageRenderContext<TaskListData>): JSX.Element {
    return <TaskListView tasks={data?.tasks ?? []} remaining={data?.remaining ?? 0} />
  }
}

/**
 * What the screen hands to its renderer.
 */
export interface TaskListData {
  tasks: Task[]
  remaining: number
}
