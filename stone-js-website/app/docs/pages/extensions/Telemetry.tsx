import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extensions/telemetry'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Telemetry } from '@stone-js/telemetry'

@Telemetry()   // spans and metrics around each event
@StoneApp({ name: 'tasks' })
export class Application {}
`

const IMP = `
import { defineStoneApp } from '@stone-js/core'
import { telemetryBlueprint } from '@stone-js/telemetry'

export const App = defineStoneApp(
  { name: 'tasks' },
  [telemetryBlueprint]
)
`

/**
 * Extensions: telemetry.
 */
@Page(PATH, { layout: 'docs' })
export class Telemetry implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Telemetry',
      description: 'Spans and metrics around each event, with pluggable exporters, so you can see what your app is doing without wiring instrumentation by hand.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='Telemetry' />
        <Lead>
          <code>@stone-js/telemetry</code> observes the app from the same place everything else attaches:
          a blueprint and a middleware. It records spans and metrics around each event and hands them to
          an exporter, so observability is configuration, not code scattered through handlers.
        </Lead>

        <H2>Install & enable</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/telemetry`}</Code>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H2>What it records</H2>
        <p>
          With telemetry enabled, each event is wrapped in a span and timed; you add your own spans and
          counters where a domain operation is worth measuring. The <code>Telemetry</code> service is
          injected like any other.
        </p>
        <Code file='app/Tasks.ts'>{`constructor ({ telemetry }) { this.telemetry = telemetry }

create (event: IncomingHttpEvent) {
  return this.telemetry.span('task.create', () => {
    const task = this.tasks.add(event.get('title'))
    this.telemetry.count('task.created')
    return task
  })
}`}</Code>

        <H3>Exporters</H3>
        <p>
          Where telemetry goes is an exporter, swapped without touching your instrumentation. The
          console exporter ships for development; point it at your platform in production.
        </p>
        <PropsTable nameHeader='Piece' rows={[
          { name: 'Telemetry', type: 'service', desc: 'Injected; create spans and metrics from your code.' },
          { name: 'TelemetryMiddleware', type: 'middleware', desc: 'Wraps each event in a span automatically.' },
          { name: 'ConsoleTelemetryExporter', type: 'exporter', desc: 'Writes telemetry to the console (development default).' },
          { name: 'telemetryBlueprint', type: 'blueprint', desc: 'Enables telemetry imperatively.' }
        ]} />

        <Callout kind='note' title='Cheap by default, deliberate when it counts'>
          Instrument the operations that matter, not everything. On serverless and edge runtimes each
          exported span has a cost; a few meaningful spans beat a firehose of noise.
        </Callout>

        <SeeAlso links={[
          { title: 'Logging', path: '/docs/essentials/logging' },
          { title: 'Middleware', path: '/docs/middleware' },
          { title: 'Service providers', path: '/docs/di/providers' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
