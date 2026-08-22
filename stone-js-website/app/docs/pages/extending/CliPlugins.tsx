import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { StoneLink } from '@stone-js/use-react'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extending/cli-plugins'

const TARGET = `
import { StoneBuilderDefinition, StoneCliPlugin } from '@stone-js/cli'

export const myBuilderDefinition: StoneBuilderDefinition = {
  target: 'my-target',
  priority: 10,
  devMode: 'self-hosted',                     // or 'supervised', if the CLI runs the process
  devEntry: () => buildPath('server.mjs'),
  previewEntry: () => buildPath('preview.mjs'),
  match: (blueprint) => hasMySources(blueprint),
  resolver: (context) => new MyBuilder(context)
}

export function myCliPlugin (): StoneCliPlugin {
  return {
    name: '@acme/my-renderer',
    description: 'Adds the my-target build.',
    blueprintMiddleware: [{ module: SetMyBuilderMiddleware, priority: 4 }]
  }
}
`

/**
 * Extending: participate in the build with a CLI plugin.
 */
@Page(PATH, { layout: 'docs' })
export class CliPlugins implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Participate in the build',
      description: 'Let a package take part in the CLI build and bundle: generate code into .stone/, contribute modules and config to the built app, all through an agnostic plugin contract.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extending' title='Participate in the build' />
        <Lead>
          Some packages need to do work at build time, not just at runtime: generate a module,
          pre-scan a folder, inject configuration the app will read once bundled. A Stone.js CLI
          plugin is how a package takes part in the build and bundle. The contract is fully agnostic:
          the CLI never knows what a plugin does, only when to call it.
        </Lead>

        <Callout kind='note' title='The CLI is a Stone.js app'>
          The build itself is a Stone.js application. Plugins do not reach into private internals:
          they receive a small, stable context and contribute through it. The same seams the CLI
          uses for its own React and server builds are the ones a plugin uses.
        </Callout>

        <H2>The contract</H2>
        <p>
          A plugin is a plain object (usually the return of a factory). It exposes a name and up to
          three optional hooks, one per moment of the lifecycle.
        </p>
        <PropsTable nameHeader='Field' rows={[
          { name: 'name', type: 'string', desc: 'A unique, human-readable name. Shown when the plugin is loaded.' },
          { name: 'description', type: 'string?', desc: 'A short summary of what the plugin does.' },
          { name: 'blueprintMiddleware', type: 'middleware[]?', desc: 'Config phase: run in the CLI blueprint pipeline to read or augment stone.builder.* before any command.' },
          { name: 'onPrepare', type: '(ctx) => void?', desc: 'Codegen phase (build and dev): write files into .stone/ and contribute modules or blueprint statements to the built app.' },
          { name: 'onBundle', type: '(ctx) => void?', desc: 'Bundle phase: run just before Rollup or Vite, for advanced bundler-level participation.' }
        ]} />

        <H3>Three moments, earliest to latest</H3>
        <PropsTable nameHeader='Hook' rows={[
          { name: 'blueprintMiddleware', type: 'config', desc: 'Augment builder config. Runs for every command, before the builders.' },
          { name: 'onPrepare', type: 'codegen', desc: 'The workhorse. Runs once per build and per dev run, before the entry point is generated.' },
          { name: 'onBundle', type: 'bundle', desc: 'Runs after every onPrepare, right before the bundler. Reach for it only for bundler options.' }
        ]} />

        <H2>The plugin context</H2>
        <p>
          Build hooks receive a stable facade. Everything a plugin needs is here, and nothing else:
          plugin authors depend on these helpers, never on CLI internals, so the CLI can evolve
          without breaking published plugins.
        </p>
        <PropsTable nameHeader='Member' rows={[
          { name: 'blueprint', type: 'IBlueprint', desc: 'Read stone.builder.*, or set config the built app will read.' },
          { name: 'command', type: 'string', desc: 'Which command is driving the lifecycle: build, dev, preview, ...' },
          { name: 'event', type: 'IncomingEvent', desc: 'The console event, carrying the CLI flags and arguments.' },
          { name: 'reporter', type: 'StoneReporter', desc: 'Branded output that matches the CLI look.' },
          { name: 'writeFile', type: '(path, content) => string', desc: 'Write a file into the .stone/tmp build directory.' },
          { name: 'addModule', type: '(specifier) => void', desc: 'Add a module to the built app: its exports join the app modules, exactly like app/** files.' },
          { name: 'addBlueprint', type: '(statement) => void', desc: 'Inject a statement into the entry configure step, where a local blueprint is in scope (server and console entries).' }
        ]} />

        <H2>A minimal plugin</H2>
        <p>
          The common shape: in <code>onPrepare</code>, generate a module into <code>.stone/</code>,
          then add it to the app with <code>addModule</code>. Its exports are collected like any
          other app module, so a generated <code>defineConfig(...)</code> reaches the built app.
        </p>
        <Code file='src/cli.ts'>{`import { defineConfig } from '@stone-js/core'

export function acmeCliPlugin (options = {}) {
  return {
    name: '@acme/stone-acme',
    description: 'Generates the Acme config at build time.',
    onPrepare (ctx) {
      // Do any build-time work here (scan a folder, read files, compute config).
      const settings = { greeting: options.greeting ?? 'hello' }

      // Generate a module the app will bundle...
      ctx.writeFile('plugins/acme.mjs', [
        "import { defineConfig } from '@stone-js/core'",
        'export const acme = defineConfig({ stone: { acme: ' + JSON.stringify(settings) + ' } })'
      ].join('\\n'))

      // ...and hand it to the built app.
      ctx.addModule('./plugins/acme.mjs')
    }
  }
}

// A ready-to-use default export, so the package can be auto-discovered.
export default acmeCliPlugin()`}</Code>

        <H2>Two ways to load a plugin</H2>
        <p>
          Both paths end in the same place. Which one you use is a trust decision, not a capability
          one.
        </p>

        <H3>Explicit, in stone.config (any package)</H3>
        <p>
          The primary path, open to every package. List the plugins your app uses. This is always
          available and always safe: the developer sees exactly what runs at build time.
        </p>
        <Code file='stone.config.mjs'>{`import { defineBuilderConfig } from '@stone-js/cli'
import { acmeCliPlugin } from '@acme/stone-acme/cli'

export default defineBuilderConfig({
  plugins: [acmeCliPlugin({ greeting: 'bonjour' })]
})`}</Code>

        <H3>Auto-discovered, first-party only (@stone-js/*)</H3>
        <p>
          A package advertises its plugin through a contract in its own <code>package.json</code>.
          The CLI loads it automatically, but only for first-party <code>@stone-js/*</code> packages,
          and only from your project direct dependencies. This keeps first-party modules truly
          zero-config while never running unvetted build-time code from a third party.
        </p>
        <Code file='node_modules/@stone-js/i18n/package.json'>{`{
  "name": "@stone-js/i18n",
  "stone": { "cliPlugin": "./dist/cli.js" }
}`}</Code>

        <Callout kind='important' title='The trust boundary'>
          Auto-discovery is enabled by default, but scoped to <code>@stone-js/*</code>, the packages
          the framework controls, and to direct dependencies only, never transitive ones. Every
          third-party plugin must be declared in <code>stone.config</code>. Each auto-discovered
          plugin is announced on every build, so a build never silently executes code you cannot see.
          Opt out entirely with <code>autoDiscoverPlugins: false</code>.
        </Callout>

        <H2>How contributions reach the app</H2>
        <p>
          The built app assembles its blueprint at runtime from the modules the bundler collected.
          A plugin does not mutate the CLI blueprint and hope it carries over: it contributes real
          modules and config that the entry point bundles. <code>addModule</code> works everywhere,
          including the browser build. <code>addBlueprint</code> targets the server and console
          entries, where a live blueprint is in scope; for the browser, prefer a generated module
          that exports <code>defineConfig(...)</code>.
        </p>

        <Callout kind='future' title='First-party has no special powers'>
          The i18n plugin that gives you zero-config translations is built exactly this way. It has
          no privileged access: a community package that writes a module in <code>onPrepare</code>
          and adds it with <code>addModule</code> participates in the build as an equal.
        </Callout>

        <H2>Register a whole build target</H2>
        <p>
          A plugin can go further than contributing to a build: it can <em>be</em> one. A target is a
          declaration on the Blueprint, so a package that knows how to turn its own sources into an
          application says so, and the CLI resolves it like any other.
        </p>
        <Code file='src/cli/index.ts'>{TARGET}</Code>
        <p>
          Three fields carry the whole contract. <code>match</code> answers whether this target is the
          one for this project, so detection stays with the package that can detect it.{' '}
          <code>devMode</code> says whether the CLI supervises a process it started or follows one
          that hosts itself. <code>resolver</code> returns the builder, whose middleware pipelines are
          ordinary pipelines: a plugin can insert into them by priority.
        </p>

        <Callout kind='future' title='The framework did this to itself, and it is the proof'>
          The CLI used to know how to build a React application, and shipped Vite to prove it, so a
          backend project installed a web bundler it never ran. That knowledge now lives in{' '}
          <StoneLink to='/docs/frontend'>the renderer</StoneLink>, registered through this exact
          mechanism, and the CLI keeps one target of its own. Its dependency on the renderer is gone
          with it. Nothing about the public path was reserved for first-party packages: the React
          target and a target of yours are declared by the same key, which is the only way the public
          path is worth anything.
        </Callout>

        <SeeAlso links={[
          { title: 'Create a package or plugin', path: '/docs/extending/package' },
          { title: 'Create CLI commands', path: '/docs/extending/commands' },
          { title: 'The Blueprint', path: '/docs/blueprint' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
