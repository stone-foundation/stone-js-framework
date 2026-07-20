import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/blueprint/build'

/**
 * Blueprint & build: the build process, codegen and targets.
 */
@Page(PATH, { layout: 'docs' })
export class BuildProcess implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'The build & targets',
      description: 'How the CLI turns your source into a running app: module discovery, codegen into .stone, and the target you build for.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Blueprint & build' title='The build & targets' />
        <Lead>
          Between your source and a running application sits the CLI. It discovers your modules, builds
          the Blueprint, generates the entry for the chosen target, and bundles it. You configure the
          little that varies in one file; the rest is derived.
        </Lead>

        <H2>What a build does</H2>
        <p>
          On <code>stone build</code> the CLI scans <code>app/</code>, letting your decorators and
          <code> define*</code> modules register onto the Blueprint, generates the target entry into
          <code> .stone/</code>, and produces the output in <code>dist/</code>. There is no registry to
          maintain: add a decorated file and it is in; delete it and it is gone.
        </p>
        <Code file='terminal' lang='bash'>{`stone dev            # dev server with hot reload
stone build          # production build (rendering deduced from adapters)
stone build --ssg    # same, pre-rendered to static HTML
stone preview        # serve the production build
stone export         # emit static output (SSG)`}</Code>

        <H2>Zero-config by default</H2>
        <p>
          There is nothing you must configure. The rendering strategy is deduced from the adapters you
          stacked, and the routes to pre-render are derived from the pages your app already declares.
          <code> stone.config.mjs</code> exists only for when you want to pin something.
        </p>
        <Code file='stone.config.mjs' lang='js'>{`import { defineConfig } from '@stone-js/cli'

// Zero-config: rendering is deduced from adapters, SSG is a build flag
// (stone build --ssg), and pre-rendered routes come from your own pages.
export default defineConfig({})`}</Code>
        <Principle
          principle={
            <p>
              A framework that already knows your adapters and your routes should not make you restate
              them. Defaults are deduced from what the app declares; configuration is a choice, never a
              tax.
            </p>
          }
          incarnation={
            <p>
              Rendering follows the adapters: a browser adapter alone is a SPA; a backend adapter alone
              is SOR (server-only rendering); both give SSR, and <code>--ssg</code> pre-renders that
              same SSR at build time. The pre-render set is collected from your scanned page routes, so
              adding a page adds a static file, with nothing to keep in sync.
            </p>
          }
        />

        <H3>Pinning it, if you want to</H3>
        <p>
          Every option stays reachable. Pin the rendering mode, add extra static paths (e.g. expanded
          parameterized routes), or tune the bundlers, all optional.
        </p>
        <Code file='stone.config.mjs' lang='js'>{`export default defineConfig({
  builder: {
    target: 'react',                 // 'react' | 'service' (usually deduced)
    rendering: 'ssg',                // pin instead of using the --ssg flag
    ssg: { routes: ['/sitemap'] }    // ADDED to the auto-derived routes
  }
})`}</Code>

        <H3>Config reference</H3>
        <PropsTable nameHeader='Setting' rows={[
          { name: "builder.target", type: "'react' | 'service'", desc: 'A frontend (React) app, or a backend service. Usually deduced.' },
          { name: 'builder.rendering', type: "'csr' | 'ssr' | 'ssg'", desc: 'Pin the rendering mode. Deduced from adapters when omitted.' },
          { name: 'builder.ssg.routes', type: 'string[]', desc: 'Extra static paths, ADDED to the routes auto-derived from your pages.' },
          { name: 'builder.lazy', type: 'boolean', default: 'true', desc: 'Per-route code splitting (and the scanned routes that feed SSG).' },
          { name: 'builder.imperative', type: 'boolean', desc: 'Favour the imperative (define*) programming style.' },
          { name: 'builder.dotenv', type: 'object', desc: 'How .env files are loaded.' },
          { name: 'builder.input', type: '{ app, views, mainCSS }', desc: 'Module-discovery globs and the auto-linked entry stylesheet.' },
          { name: 'builder.browser.excludedModules', type: 'string[]', desc: 'Modules to keep out of the browser build (server-only code).' },
          { name: 'public', type: 'string', default: "'public'", desc: 'A directory copied verbatim to the build root.' },
          { name: 'output', type: 'string', desc: 'The build output path.' },
          { name: 'builder.vite / builder.rollup', type: 'passthrough', desc: 'Escape hatches to the underlying Vite (frontend) and Rollup (service) configs.' }
        ]} />
        <p>
          Two escape hatches matter when you outgrow the defaults: <code>builder.vite</code> and
          <code> builder.rollup</code> pass options straight to the bundlers, and
          <code> builder.browser.excludedModules</code> keeps server-only code (a database driver, a
          secret) out of the client bundle.
        </p>

        <H2>The .stone directory</H2>
        <p>
          <code>.stone/</code> is generated: the entry that wires your discovered modules for the
          chosen target, plus intermediate artifacts. It is derived output, regenerated on every
          build. Never edit it or commit it; deleting it is safe.
        </p>

        <Callout kind='note' title='One source tree, every target'>
          The same <code>app/</code> builds to a Node service, an edge function, a static site or an
          agent runtime. Only the manifest (adapters) and a line of config change, which is the whole
          "build once, deploy anywhere" promise made mechanical.
        </Callout>

        <SeeAlso links={[
          { title: 'Meta-modules & define*', path: '/docs/blueprint/meta-modules' },
          { title: 'CLI reference', path: '/docs/reference/cli' },
          { title: 'Configuration reference', path: '/docs/reference/config' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
