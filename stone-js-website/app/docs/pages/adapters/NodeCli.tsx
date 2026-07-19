import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/adapters/node-cli'

const DECL = `
import { NodeConsole, Command } from '@stone-js/node-cli-adapter'

@Command({
  name: 'tasks:prune',
  alias: 'prune',
  args: ['[days]'],
  description: 'Delete tasks done more than [days] ago (default 30).'
})
export class PruneCommand {
  constructor ({ tasks }: { tasks: TaskService }) { this.tasks = tasks }

  handle (event: NodeCliEvent) {
    const days = Number(event.get('days', 30))
    const removed = this.tasks.prune(days)
    return \`Pruned \${removed} tasks\`
  }
}
`

const IMP = `
import { defineCommand } from '@stone-js/node-cli-adapter'

const PruneCommand = ({ tasks }) => ({
  handle: (event) => \`Pruned \${tasks.prune(Number(event.get('days', 30)))} tasks\`
})

export const commands = [
  defineCommand(PruneCommand, { name: 'tasks:prune', args: ['[days]'] }, true)
]
`

/**
 * Adapters: Node CLI (commands).
 */
@Page(PATH, { layout: 'docs' })
export class NodeCli implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Node CLI adapter',
      description: 'Turn your domain into command-line tools: define commands with @Command and run them through the stone CLI.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Adapters' title='Node CLI' />
        <Lead>
          <code>@stone-js/node-cli-adapter</code> lets the same domain answer command-line invocations.
          A command is another cause: the adapter normalises argv into an intention, and your handler
          runs exactly as it would for an HTTP request.
        </Lead>

        <H2>Install & enable</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/node-cli-adapter`}</Code>
        <CodeTabs
          file='app/Application.ts'
          decl={`import { NodeConsole } from '@stone-js/node-cli-adapter'

@NodeConsole()
@StoneApp({ name: 'tasks' })
export class Application {}`}
          imp={`import { nodeConsoleAdapterBlueprint } from '@stone-js/node-cli-adapter'

export const App = defineStoneApp({ name: 'tasks' }, [nodeConsoleAdapterBlueprint])`}
        />

        <H2>Defining a command</H2>
        <p>
          Mark a class with <code>@Command</code> (or register a <code>defineCommand</code>). It reads
          arguments off the event with <code>event.get()</code>, resolves services from the container,
          and returns output.
        </p>
        <CodeTabs file='app/commands/Prune.ts' decl={DECL} imp={IMP} />
        <Code file='terminal' lang='bash'>{`node app tasks:prune 14     # run it
node app prune 14           # via its alias`}</Code>

        <H3>Command options</H3>
        <PropsTable rows={[
          { name: 'name', type: 'string', required: true, desc: 'The command name, e.g. "tasks:prune".' },
          { name: 'alias', type: 'string | string[]', desc: 'Alternative name(s).' },
          { name: 'args', type: 'string | string[]', desc: 'Declared arguments, e.g. "[days]" (optional) or "<id>" (required).' },
          { name: 'description', type: 'string', desc: 'Shown in help output.' }
        ]} />

        <Callout kind='note' title='Same domain, another cause'>
          A command handler is an event handler. It shares services, validation and errors with your
          HTTP routes, so a "prune" command and a "DELETE /tasks" route can call the very same service
          method. One domain, two causes.
        </Callout>

        <SeeAlso links={[
          { title: 'Node HTTP', path: '/docs/adapters/node-http' },
          { title: 'Backend context', path: '/docs/contexts/backend' },
          { title: 'CLI reference', path: '/docs/reference/cli' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
