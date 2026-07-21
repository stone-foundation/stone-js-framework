import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/start/troubleshooting'

/**
 * Start: troubleshooting & FAQ.
 */
@Page(PATH, { layout: 'docs' })
export class Troubleshooting implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Troubleshooting & FAQ',
      description: 'The first failures you might hit with Stone.js and how to fix them: decorators, ESM, the .stone codegen, workspace types, routing and responses.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Start here' title='Troubleshooting & FAQ' />
        <Lead>
          Most first-run problems come from one of a few places: the decorator toolchain, ESM, the
          <code> .stone</code> codegen, or workspace type resolution. Here is how to recognise and fix
          each, plus answers to the questions that come up most.
        </Lead>

        <H2>Decorators do nothing / metadata is missing</H2>
        <p>
          Stone.js uses <strong>TC39 stage-3 decorators</strong> (the 2023-11 standard) with
          <code> Symbol.metadata</code>, not the legacy TypeScript ones. If a decorator seems ignored,
          your toolchain is almost certainly emitting the old form. Do <strong>not</strong> enable
          <code> experimentalDecorators</code> or <code>emitDecoratorMetadata</code>, and never install
          <code> reflect-metadata</code>. The Stone.js CLI already configures Babel correctly; if you
          run your own build, use the stage-3 plugin:
        </p>
        <Code file='babel (only if you bypass the Stone CLI)' lang='json'>{`{
  "plugins": [["@babel/plugin-proposal-decorators", { "version": "2023-11" }]]
}`}</Code>
        <Callout kind='important' title='Node version'>
          Stone.js targets <code>Node &gt;= 20.11</code> and is <strong>ESM-only</strong>. On an older
          Node, or with <code>"type": "commonjs"</code>, decorators and <code>Symbol.metadata</code>
          will not behave. Check with <code>node -v</code> and keep <code>"type": "module"</code>.
        </Callout>

        <H2>Stale build after editing code (the <code>.stone</code> folder)</H2>
        <p>
          The CLI generates a <code>.stone/</code> directory (module manifest, route table, entry) at
          build time. If a newly added handler, page or command is not picked up, the codegen cache is
          stale. Clear it and rebuild:
        </p>
        <Code file='terminal' lang='bash'>{`stone cache clear      # drop the .stone codegen cache
npm run dev            # or: npm run build`}</Code>
        <p>
          Commit nothing from <code>.stone/</code> or <code>dist/</code>: both are generated.
        </p>

        <H2><code>any</code> types or unresolved <code>@stone-js/*</code> imports in a monorepo</H2>
        <p>
          Type-aware tools (your editor, <code>tsc</code>, type-aware lint) read a dependency's types
          from its <strong>built</strong> <code>dist/*.d.ts</code>. In a fresh workspace clone where
          nothing is built yet, imports from sibling <code>@stone-js/*</code> packages can resolve to
          <code> any</code>. Build once so the declaration files exist:
        </p>
        <Code file='terminal' lang='bash'>{`pnpm build             # build every package (topological)
# or a single graph:  pnpm --filter @stone-js/core... build`}</Code>

        <H2>"No response was returned"</H2>
        <p>
          A handler must return a value; the kernel resolves that value into a response per event. An
          <code> InitializationError: No response was returned</code> means a handler path returned
          <code> undefined</code>. Return the payload (or an explicit response), and remember that the
          status code belongs to the platform layer, not your domain: a bare returned value becomes a
          <code> 200</code> over HTTP, an exit code on the CLI.
        </p>

        <H2>A route 404s unexpectedly</H2>
        <p>
          A missed match is a not-found the error handler maps to <code>404</code>, never a crash. Check
          precedence (static beats dynamic), host/domain constraints, and the HTTP method. Add a
          fallback route for a friendly page. See <a href='/docs/routing/matching'>Matching &amp;
          precedence</a>.
        </p>

        <H2>FAQ</H2>
        <H3>Do I have to use decorators?</H3>
        <p>
          No. Every declarative decorator has an imperative <code>define*</code> equivalent, at parity.
          Pick either; mix if you like.
        </p>
        <H3>Which adapter do I choose?</H3>
        <p>
          You do not choose one, you stack the ones you target (<code>@NodeHttp</code>, <code>@Fetch</code>,
          <code>@AwsLambdaHttp</code>, <code>@Mcp</code>…). The runtime that receives the request
          collapses the choice; the domain is written once.
        </p>
        <H3>TypeScript or JavaScript?</H3>
        <p>
          Both. The JavaScript variants keep stage-3 decorators and strip types; there is no second
          source to maintain.
        </p>
        <H3>Is it production-ready?</H3>
        <p>
          The framework is in beta ahead of a 1.0. See the versioning policy for what stability the
          current line promises before you adopt it for a critical workload.
        </p>

        <SeeAlso links={[
          { title: 'Install & create', path: '/docs/start/install' },
          { title: 'Project anatomy', path: '/docs/start/anatomy' },
          { title: 'Matching & precedence', path: '/docs/routing/matching' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
