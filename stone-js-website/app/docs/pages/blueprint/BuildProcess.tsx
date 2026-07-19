import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

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
        <Code file='terminal' lang='bash'>{`stone dev        # dev server with hot reload
stone build      # production build for the configured target
stone preview    # serve the production build
stone export     # emit static output (SSG)`}</Code>

        <H2>Configuration</H2>
        <p>
          <code>stone.config.mjs</code> holds the few build-time choices: the target, the rendering
          strategy, the routes to pre-render, and any Vite or asset tuning.
        </p>
        <Code file='stone.config.mjs' lang='js'>{`import { defineConfig } from '@stone-js/cli'

export default defineConfig({
  builder: { target: 'react' },      // 'react' | 'service'
  rendering: 'ssg',                  // 'csr' | 'ssr' | 'ssg' (frontend)
  ssg: { routes: ['/', '/about'] }
})`}</Code>

        <H3>Targets</H3>
        <PropsTable nameHeader='Setting' rows={[
          { name: "builder.target", type: "'react' | 'service'", desc: 'A frontend (React) app, or a backend service.' },
          { name: 'rendering', type: "'csr' | 'ssr' | 'ssg'", desc: 'How a React app is rendered (see Frontend).' },
          { name: 'ssg.routes', type: 'string[]', desc: 'The routes pre-rendered to static HTML.' },
          { name: 'public', type: 'string', default: "'public'", desc: 'A directory copied verbatim to the build root.' },
          { name: 'output', type: 'string', desc: 'The build output path.' }
        ]} />

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
