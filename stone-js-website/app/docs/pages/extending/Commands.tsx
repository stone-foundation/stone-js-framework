import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extending/commands'

const DECL = `
import { Command } from '@stone-js/node-cli-adapter'

@Command({
  name: 'tasks:import',
  alias: 'import',
  args: ['<file>', '[--dry-run]'],
  description: 'Import tasks from a CSV file.'
})
export class ImportCommand {
  constructor ({ tasks, logger }: { tasks: TaskService, logger: ILogger }) {
    this.tasks = tasks; this.logger = logger
  }

  async handle (event: NodeCliEvent) {
    const file = event.get<string>('file')            // positional <file>
    const dryRun = event.get<boolean>('dry-run', false)  // flag
    const rows = await readCsv(file)
    if (dryRun) return \`Would import \${rows.length} tasks\`
    rows.forEach((r) => this.tasks.add(r.title))
    this.logger.info('imported', { count: rows.length })
    return \`Imported \${rows.length} tasks\`
  }
}
`

const IMP = `
import { defineCommand } from '@stone-js/node-cli-adapter'

const ImportCommand = ({ tasks }) => ({
  handle: async (event) => {
    const rows = await readCsv(event.get('file'))
    rows.forEach((r) => tasks.add(r.title))
    return \`Imported \${rows.length} tasks\`
  }
})

export const commands = [
  defineCommand(ImportCommand, {
    name: 'tasks:import',
    args: ['<file>', '[--dry-run]'],
    description: 'Import tasks from a CSV file.'
  }, true)
]
`

/**
 * Extending: create CLI commands (in depth).
 */
@Page(PATH, { layout: 'docs' })
export class Commands implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Create CLI commands',
      description: 'Author command-line tools on your domain: declare arguments and flags, read parsed input, and return output, all through the same handler contract.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extending' title='Create CLI commands' />
        <Lead>
          A command is a handler for a command-line cause. With the Node CLI adapter enabled, you
          declare commands with <code>@Command</code> (or <code>defineCommand</code>), read parsed
          arguments and flags off the event, and return output. The domain and its services are the
          same ones your HTTP routes use.
        </Lead>

        <H2>Enable the adapter</H2>
        <p>
          Commands need <code>@stone-js/node-cli-adapter</code>. Add <code>@NodeConsole()</code> (or the
          blueprint) to the manifest; the adapter page covers setup. This page is the command author's
          deep reference.
        </p>

        <H2>Declaring a command</H2>
        <CodeTabs file='app/commands/Import.ts' decl={DECL} imp={IMP} />

        <H3>Arguments and flags</H3>
        <p>
          Declare inputs in <code>args</code>; the adapter parses them and puts them on the event, read
          with <code>event.get()</code> like any intention. The conventions:
        </p>
        <PropsTable nameHeader='Syntax' rows={[
          { name: '<file>', type: 'required positional', desc: 'A required argument; the command errors without it.' },
          { name: '[file]', type: 'optional positional', desc: 'An optional argument.' },
          { name: '[--dry-run]', type: 'boolean flag', desc: 'A flag, read as a boolean.' },
          { name: '[--limit=<n>]', type: 'valued flag', desc: 'A flag that carries a value.' }
        ]} />

        <H3>Command options</H3>
        <PropsTable rows={[
          { name: 'name', type: 'string', required: true, desc: 'The command name, e.g. "tasks:import".' },
          { name: 'alias', type: 'string | string[]', desc: 'Alternative name(s).' },
          { name: 'args', type: 'string | string[]', desc: 'Declared arguments and flags.' },
          { name: 'description', type: 'string', desc: 'Shown in help output.' }
        ]} />

        <H2>Output</H2>
        <p>
          Return a string (or structured data) and the adapter writes it out; throw a domain error and
          it is reported with a non-zero exit, mapped the same way HTTP errors are. Use the injected
          logger for progress, the return value for the result.
        </p>
        <Code file='terminal' lang='bash'>{`node app tasks:import ./seed.csv --dry-run
node app import ./seed.csv          # via the alias`}</Code>

        <Callout kind='note' title='Commands share everything'>
          A command handler is an event handler: same container, same services, same validation and
          error handling. A "tasks:import" command and a "POST /tasks" route can call the very same
          service method. One domain, many causes.
        </Callout>

        <SeeAlso links={[
          { title: 'Node CLI adapter', path: '/docs/adapters/node-cli' },
          { title: 'Event handlers', path: '/docs/essentials/event-handlers' },
          { title: 'CLI reference', path: '/docs/reference/cli' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
