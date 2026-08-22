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

        <H2>The health probe</H2>
        <p>
          Telemetry is what you read after the fact; a health probe is the question asked in the moment,
          by something that cannot read: a load balancer deciding whether to route traffic, a platform
          deciding whether to replace an instance. Enabling telemetry publishes it at{' '}
          <code>/health</code>, and the answer is a status code first: <code>200</code> to route here,
          {' '}<code>503</code> to stop. The body is for the person who follows up.
        </p>
        <p>
          With nothing registered it answers <code>200</code>, which is the truthful answer to "is this
          process up and routing". Register a check and the answer starts meaning more:
        </p>
        <Code file='app/health/DatabaseCheck.ts'>{`import { HealthCheck } from '@stone-js/telemetry'

@HealthCheck('database')
export class DatabaseCheck {
  constructor ({ db }) { this.db = db }          // resolved, like any service

  async check () {
    return await this.db.ping()                   // true, or { healthy: false, detail: '…' }
  }
}`}</Code>
        <PropsTable nameHeader='key' rows={[
          { name: 'stone.telemetry.health.path', type: 'string | false', default: "'/health'", desc: 'Where the probe answers. false serves nothing, for a deployment that answers it elsewhere.' },
          { name: 'stone.telemetry.health.checks', type: 'MetaHealthCheck[]', desc: 'The registered checks. A module or an application adds to this list; the decorator does it for you.' },
          { name: 'stone.telemetry.health.timeout', type: 'number', default: '2000', desc: 'How long a single check may take before it counts as failed.' }
        ]} />
        <Callout kind='note' title='Outside the API version, deliberately'>
          Both operational endpoints escape the router's global prefix: under a <code>/v1</code>{' '}
          router, the probe answers at <code>/health</code>, not <code>/v1/health</code>. A load
          balancer knows no version, and a probe that moves the day the API version does is a probe
          that goes dark. The declared path is served exactly as declared; write the version into
          {' '}<code>stone.telemetry.health.path</code> yourself if you truly want it versioned.
        </Callout>

        <Callout kind='note' title='It never hangs, and never stops at the first failure'>
          A check that does not answer within its timeout is a failed check, because a probe that waits
          is worse than one that fails: the platform waits with it. And a check that throws reports its
          own failure while the others report theirs, since the point of a report is to name every
          dependency that is down. The probe stays out of the published API contract: a contract
          describing <code>/health</code> tells a consumer nothing they can use.
        </Callout>

        <H2>Which build is answering</H2>
        <p>
          A different question from the probe, and worth keeping separate. A probe is asked by a platform
          that cannot read and only needs a verdict; this one is asked by a person mid-investigation, and
          the answer is a fact. Is the deploy live yet. Is that canary the new build. Why does production
          behave differently. Enabling telemetry publishes it at <code>/version</code>:
        </p>
        <Code file='terminal' lang='bash'>{`curl https://api.example/version
{"name":"my-api","env":"production","platform":"aws_lambda_http","release":"2026.08.21-3"}`}</Code>
        <p>
          <code>platform</code> earns its place: one artefact can carry several adapters, each claiming
          the runtime it detects, so which one won is not knowable from the outside. The release is
          declared, never guessed from the environment, because an application already knows it and
          already has a place to put what it knows:
        </p>
        <Code file='app/configurations/BuildConfiguration.ts'>{`@Configuration()
export class BuildConfiguration implements IConfiguration {
  configure (blueprint: IBlueprint): void {
    blueprint.set('stone.telemetry.version.release', myReleaseTag)
  }
}`}</Code>
        <PropsTable nameHeader='key' rows={[
          { name: 'stone.telemetry.version.path', type: 'string | false', default: "'/version'", desc: 'Where it answers. false serves nothing, when even that is more than you want to say.' },
          { name: 'stone.telemetry.version.release', type: 'string', default: "'unknown'", desc: 'What this build is called: a tag, a commit, a release number.' }
        ]} />

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
