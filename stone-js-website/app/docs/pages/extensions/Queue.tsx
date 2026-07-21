import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extensions/queue'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Queue } from '@stone-js/queue'

@Queue({ driver: 'redis', url: 'redis://localhost:6379' })
@StoneApp({ name: 'app' })
export class Application {}
`

const IMP = `
import { defineConfig } from '@stone-js/core'
import { defineQueue } from '@stone-js/queue'

export const AppConfig = defineConfig(defineQueue({
  default: 'redis',
  connections: [
    { name: 'redis', driver: 'redis', url: 'redis://localhost:6379', prefix: 'jobs' },
    { name: 'sync', driver: 'memory' }
  ]
}))
`

/**
 * Extensions: Queue.
 */
@Page(PATH, { layout: 'docs' })
export class Queue implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Queue',
      description: 'Agnostic job queue: dispatch now or later, process with a worker, retry with backoff. Memory and Redis drivers, @JobHandler, and a queue injected in the container.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='Queue' />
        <Lead>
          Push slow work off the request path. <code>@stone-js/queue</code> lets you
          <code> dispatch</code> a job now or later, process it with a worker, and retry it with
          backoff, over a memory queue (zero-config) or Redis. Dispatch is injected as
          <code> queue</code>; handlers are plain, dependency-injected classes.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/queue
npm i ioredis   # only for the Redis connection`}</Code>

        <H2>Enable it</H2>
        <Principle
          principle={
            <p>
              A request should return as soon as the user's intent is captured. The work it triggers,
              emails, thumbnails, webhooks, belongs on a queue, not in the response.
            </p>
          }
          incarnation={
            <p>
              One <code>QueueConnection</code> contract backs every driver. The provider binds the
              manager as <code>queueManager</code>, the default connection as <code>queue</code>, the
              handler registry, and a <code>worker</code>.
            </p>
          }
        />
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H3>Dispatch</H3>
        <Code file='app/OrderService.ts'>{`export class OrderService {
  constructor (private readonly queue) {}

  async checkout (order) {
    // returns immediately; the receipt is sent by a worker
    await this.queue.dispatch('send-receipt', { orderId: order.id }, { delay: 5, maxAttempts: 3, backoff: 10 })
  }
}`}</Code>

        <H3>Handle</H3>
        <Code file='app/SendReceipt.ts'>{`import { JobHandler } from '@stone-js/queue'

@JobHandler('send-receipt')
export class SendReceipt {
  constructor (private readonly mailer) {}          // dependency-injected
  async handle (payload: { orderId: string }) {
    await this.mailer.receipt(payload.orderId)
  }
}`}</Code>
        <p>
          One class can also handle several jobs, one method each, with <code>@OnJob</code> (a
          name-less <code>@JobHandler()</code> marks the class for scanning):
        </p>
        <Code file='app/Jobs.ts'>{`import { JobHandler, OnJob } from '@stone-js/queue'

@JobHandler()
export class Jobs {
  @OnJob('resize') async resize (payload) { /* … */ }
  @OnJob('purge')  async purge (payload) { /* … */ }
}`}</Code>

        <H3>Process</H3>
        <p>
          Run the worker in a long-running process. It reserves each job, runs its handler and acks
          it; on failure it retries with linear backoff up to <code>maxAttempts</code>, then
          dead-letters.
        </p>
        <Code file='app/Consumer.ts'>{`export class Consumer {
  constructor (private readonly worker) {}
  async start () { await this.worker.run({ queues: ['default'], sleep: 1000 }) }
}`}</Code>
        <Callout kind='note' title='Serverless needs no worker'>
          On FaaS there is no long-running worker: the provider queue adapter (SQS, Pub/Sub, Azure)
          invokes your function per message and routes to the same handlers. The Node worker is for
          long-running processes.
        </Callout>

        <H2>Drivers</H2>
        <PropsTable nameHeader='driver' rows={[
          { name: 'memory', type: 'built-in', desc: 'In-process, with delay, retries and a dead-letter list. Zero-config default; single process.' },
          { name: 'redis', type: 'ioredis', desc: 'Shared and reliable: ready LIST + delayed ZSET + processing LIST (crash-safe reservation).' },
          { name: 'provider', type: 'coming next', desc: 'SQS, Pub/Sub, Azure Storage Queue, wired to the FaaS adapters.' }
        ]} />

        <SeeAlso links={[
          { title: 'Cache', path: '/docs/extensions/cache' },
          { title: 'Service container & DI', path: '/docs/foundations/container' },
          { title: 'Edge & Serverless context', path: '/docs/contexts/edge' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
