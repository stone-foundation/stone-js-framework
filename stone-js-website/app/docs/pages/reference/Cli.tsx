import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Pager } from '../../components/content'

const PATH = '/docs/reference/cli'

const COMMANDS = [
  { cmd: 'stone dev', desc: 'Start the development server with hot reload.' },
  { cmd: 'stone build', desc: 'Produce the production build for your configured target.' },
  { cmd: 'stone preview', desc: 'Serve the production build locally.' },
  { cmd: 'stone export', desc: 'Emit the static output (SSG) to disk.' },
  { cmd: 'stone list', desc: 'List the routes and commands the Blueprint resolves.' },
  { cmd: 'stone <custom>', desc: 'Run a handler exposed as a CLI command (node-cli-adapter).' }
]

/**
 * Reference: the CLI.
 */
@Page(PATH, { layout: 'docs' })
export class Cli implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'CLI reference',
      description: 'The stone command line: dev, build, preview, export, and your own handlers as commands.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Reference' title='CLI reference' />
        <Lead>
          One command line drives every project type. It reads the same Blueprint your app does, so
          the commands available reflect the adapters you stacked, not a fixed list.
        </Lead>

        <H2>Commands</H2>
        <div className='table-wrap'>
          <table>
            <thead><tr><th>Command</th><th>What it does</th></tr></thead>
            <tbody>
              {COMMANDS.map((c) => <tr key={c.cmd}><td>{c.cmd}</td><td>{c.desc}</td></tr>)}
            </tbody>
          </table>
        </div>

        <H2>Typical flow</H2>
        <Code file='terminal' lang='bash'>{`npm create @stone-js@latest my-app   # scaffold
cd my-app && npm install
npm run dev                          # stone dev
npm run build                        # stone build
npm run preview                      # stone preview`}</Code>

        <H2>The codegen directory</H2>
        <p>
          The CLI generates a <code>.stone/</code> directory during a build: the entry that
          discovers your modules, and the wiring for the chosen target. It is derived output, safe
          to delete, and regenerated on the next build. Do not edit it or commit it.
        </p>

        <Callout kind='note' title='Handlers as commands'>
          With <code>@stone-js/node-cli-adapter</code> stacked, a handler is invokable as a
          command. The same domain that answers HTTP answers <code>stone tasks:list</code>, because
          a command is just another cause the adapter normalises into an intention.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
