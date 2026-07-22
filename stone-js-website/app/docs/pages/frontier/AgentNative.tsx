import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/frontier/agent-native'

/**
 * Frontier: agent-native patterns.
 */
@Page(PATH, { layout: 'docs' })
export class AgentNative implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Agent-native patterns',
      description: 'Design a domain that reasoning systems can use well: tools with intent, contracts they can read, and a framework that teaches itself to coding agents.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Frontier' title='Agent-native patterns' />
        <Lead>
          Exposing your app to agents is one adapter, as the contexts section showed. Designing an
          app agents use <em>well</em> is a craft. This is where the framework's bet on agents as a
          first-class runtime turns into concrete practice.
        </Lead>

        <H2>Tools are intentions with names</H2>
        <Principle
          principle={
            <p>
              A reasoning system chooses a tool by its name and description, not by reading your
              code. So the unit of design is the intention: a verb, a clear contract, a predictable
              result. Handlers that already read as intentions make excellent tools.
            </p>
          }
          incarnation={
            <p>
              When the runtime agent context ships, well-named handlers become MCP tools directly, no
              rewrite. The work is naming and scoping them now: <code>task.create</code> beats
              <code> doStuff</code>, and a tight schema tells the model exactly what to pass.
            </p>
          }
        />
        <Code file='app/Tasks.ts'>{`@Post('/', { name: 'task.create', middleware: [validate({ body: NewTask })] })
create (event) { return this.store.add(event.get('body')) }
// as a tool: name = "task.create", args validated by NewTask, result = the task`}</Code>

        <H2>Give agents a contract to read</H2>
        <p>
          An agent that can read your contract guesses less and fails less. You already produce one:
          the OpenAPI document derived from your schemas is a machine-readable description of every
          intention your app accepts.
        </p>

        <H3>Teach the coding agent, too</H3>
        <p>
          There are two agents in the room. The runtime agent calls your app; the coding agent
          builds with the framework. The second one needs to understand Stone.js itself.
        </p>
        <ul>
          <li><strong>@stone-js/mcp-dev</strong>: <code>stone mcp</code> serves the framework and your app to a coding assistant, so it queries concepts, modules, routes and config live instead of scanning packages.</li>
          <li><strong>llms.txt</strong>: a machine-readable map of these docs, served at the site root, so any model can load the whole mental model at once.</li>
        </ul>
        <Code file='terminal' lang='bash'>{`curl https://stonejs.dev/llms.txt   # the docs, as a map a model can read`}</Code>

        <Aphorism>The model masters the context. You master the domain. Together, you ship.</Aphorism>

        <Callout kind='future' title='Where the framework is aimed'>
          Every other context was already here when Stone.js modelled it. Agents were not; the
          model anticipated them. Building an app whose domain is legible to machines is no longer
          exotic, it is the natural end of writing the what and deferring the where.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
