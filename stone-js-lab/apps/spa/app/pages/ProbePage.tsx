import { JSX } from 'react'
import { IPage, Page, PageRenderContext, ReactIncomingEvent } from '@stone-js/use-react'

interface Task { id: string, title: string, done: boolean }
interface ProbeData { tasks: Task[], remaining: number }

@Page('/probe')
export class ProbePage implements IPage<ReactIncomingEvent> {
  handle (): ProbeData {
    const tasks: Task[] = [
      { id: '1', title: 'Write the domain once', done: true },
      { id: '2', title: 'Run it on the web', done: true },
      { id: '3', title: 'Run the same code on a phone', done: false }
    ]
    return { tasks, remaining: tasks.filter((t) => !t.done).length }
  }

  render ({ data }: PageRenderContext<ProbeData>): JSX.Element {
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
