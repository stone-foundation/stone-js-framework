import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Pager } from '../../components/content'

const PATH = '/docs/reference/cli'

const COMMANDS = [
  { cmd: 'stone serve', alias: 'dev', desc: 'Start the development server with hot reload.' },
  { cmd: 'stone build', alias: 'prod', desc: 'Produce the production build for your configured target.' },
  { cmd: 'stone preview', alias: 'p', desc: 'Serve the production build locally.' },
  { cmd: 'stone export', alias: 'e', desc: 'Emit the static output (SSG) to disk.' },
  { cmd: 'stone list', alias: 'ls', desc: 'List the routes and commands the Blueprint resolves.' },
  { cmd: 'stone init', alias: 'i', desc: 'Scaffold a new project into the current directory.' },
  { cmd: 'stone typings', alias: 't', desc: 'Generate the .stone/ type declarations (add --watch).' },
  { cmd: 'stone cache-clear', alias: 'cc', desc: 'Clear the build cache.' },
  { cmd: 'stone <custom>', alias: '·', desc: 'Run a handler exposed as a CLI command (node-cli-adapter).' }
]

const FLAGS = [
  { flag: '--ssg', on: 'build, export', desc: 'Force static generation, regardless of the configured rendering mode.' },
  { flag: '--rendering, -r', on: 'serve, build', desc: 'Pick the rendering mode for this run: csr, ssr or ssg.' },
  { flag: '--lazy', on: 'build', desc: 'Build lazily: emit only what the entry actually reaches.' },
  { flag: '--imperative, -i', on: 'serve', desc: 'Run against the imperative entry instead of the decorated one.' },
  { flag: '--language, -lang', on: 'serve, build', desc: 'Target language for the build (ts or js).' },
  { flag: '--target, -t', on: 'preview', desc: 'Which built target to preview.' },
  { flag: '--starters, -s', on: 'init', desc: 'Pick a starter template for the new project.' },
  { flag: '--yes, -y / --force, -f', on: 'init', desc: 'Skip prompts / overwrite an existing directory.' },
  { flag: '--watch, -w', on: 'typings', desc: 'Regenerate declarations on change.' }
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
            <thead><tr><th>Command</th><th>Alias</th><th>What it does</th></tr></thead>
            <tbody>
              {COMMANDS.map((c) => <tr key={c.cmd}><td>{c.cmd}</td><td><code>{c.alias}</code></td><td>{c.desc}</td></tr>)}
            </tbody>
          </table>
        </div>
        <p>
          Names and aliases are interchangeable: <code>stone dev</code> is <code>stone serve</code>,
          <code> stone prod</code> is <code>stone build</code>. The list is not fixed. It grows with the
          adapters you stack, because each command is itself a handler the CLI adapter resolves from the
          Blueprint.
        </p>

        <H2>Flags</H2>
        <div className='table-wrap'>
          <table>
            <thead><tr><th>Flag</th><th>On</th><th>What it does</th></tr></thead>
            <tbody>
              {FLAGS.map((f) => <tr key={f.flag}><td><code>{f.flag}</code></td><td>{f.on}</td><td>{f.desc}</td></tr>)}
            </tbody>
          </table>
        </div>
        <p>
          A flag is a shortcut over the Blueprint: <code>--ssg</code> is the same decision as
          <code> stone.builder.rendering = 'ssg'</code>, taken for one run instead of written into config.
        </p>

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
