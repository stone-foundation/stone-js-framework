import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Pager } from '../../components/content'

const PATH = '/docs/start/anatomy'

/**
 * Start here: project anatomy.
 */
@Page(PATH, { layout: 'docs' })
export class Anatomy implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Project anatomy',
      description: 'What the scaffold creates and why: the domain, the manifest, the build config, and the generated output.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Start here' title='Project anatomy' />
        <Lead>
          A Stone.js project is small and its shape mirrors the architecture: your domain in one
          place, the manifest that gives it a context in another, and a thin layer of build config.
          There is very little framework to see.
        </Lead>

        <H2>The layout</H2>
        <Code file='my-app/' lang='text'>{`app/
  Application.ts     the manifest: adapters and app-wide config live here
  Tasks.ts           your domain: services and handlers
  pages/             React pages (frontend projects)
assets/
  css/index.css      the entry stylesheet, auto-linked
public/              copied verbatim to the build root (llms.txt, robots, ...)
stone.config.mjs     build & rendering config (target, SSG routes)
.stone/              generated on build (safe to delete, never edit)
dist/                the build output`}</Code>

        <H2>The two files that matter</H2>
        <p>
          Everything else is convention. Two files carry the meaning:
        </p>
        <ul>
          <li><strong><code>app/Application.ts</code></strong>: the manifest. The only place that names platforms (adapters) and sets app-wide options. This is the setup dimension made concrete.</li>
          <li><strong>your domain files</strong> (<code>app/Tasks.ts</code> and friends): services and handlers. No structure is imposed; organise them however your domain wants.</li>
        </ul>

        <H2>How your code is found</H2>
        <p>
          You never maintain a registry of handlers or services. At build time the CLI scans
          <code> app/</code>, and your decorators (or <code>define*</code> modules) register
          themselves onto the Blueprint. Add a file with a decorated class and it is part of the app;
          delete it and it is gone. No wiring file to keep in sync.
        </p>

        <Code file='stone.config.mjs' lang='js'>{`import { defineConfig } from '@stone-js/cli'

export default defineConfig({
  rendering: 'ssg',              // 'csr' | 'ssr' | 'ssg' (frontend)
  ssg: { routes: ['/', '/about'] }
})`}</Code>

        <Callout kind='note' title='.stone and dist are derived'>
          <code>.stone/</code> (codegen) and <code>dist/</code> (build output) are produced from your
          source and regenerated on every build. Never edit or commit them; deleting them is safe.
        </Callout>

        <Callout kind='future' title='The same tree, every target'>
          This layout does not change when you change contexts. The same <code>app/</code> builds to
          a Node server, an edge function, a static site or an agent service; only the manifest and
          a line of config differ.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
