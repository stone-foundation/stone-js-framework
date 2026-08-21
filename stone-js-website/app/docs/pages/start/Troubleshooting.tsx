import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

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

        <H2>Decorators do nothing, or `SetupError: This decorator can only be applied to...`</H2>
        <p>
          Stone.js uses <strong>TC39 stage-3 decorators</strong> (the 2023-11 standard) with
          <code> Symbol.metadata</code>, never the legacy TypeScript ones and never
          <code> reflect-metadata</code>. Almost every problem here comes from one rule:
        </p>
        <Callout kind='important' title='Every transformer in the project must emit 2023-11'>
          <code>experimentalDecorators: true</code> is a <strong>compiler</strong> setting you cannot
          avoid today (see below), but it also tells <strong>esbuild</strong> to emit the
          <em> legacy</em> form. So any decorated class imported under an esbuild-based tool (Vitest,
          Vite) throws <code>SetupError: This decorator can only be applied to class methods</code>.
          Babel with <code>version: 2023-11</code> is what keeps the runtime correct.
        </Callout>
        <p>
          <strong>Why the flag is required.</strong> The published method-decorator signatures are
          legacy-shaped, because that is the only shape TypeScript knows, while the bodies require a
          2023-11 context. Without the flag, a method decorator does not typecheck
          (<code>TS1241</code>, <code>TS1270</code>); with it, it compiles and Babel makes sure the
          legacy form never exists at run time. Class decorators alone do not need it.
        </p>
        <Code file='tsconfig.json' lang='json'>{`{
  "compilerOptions": {
    // Appeases the compiler for method decorators. Babel emits 2023-11 at build time,
    // so the legacy form never reaches the runtime.
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false
  }
}`}</Code>
        <p>
          The Stone.js CLI configures Babel for you. If you run your <strong>own</strong> build, or a
          test runner, add the plugin yourself:
        </p>
        <Code file='babel (only if you bypass the Stone CLI)' lang='json'>{`{
  "plugins": [["@babel/plugin-proposal-decorators", { "version": "2023-11" }]]
}`}</Code>
        <H3>Testing a real application with Vitest</H3>
        <p>
          Vitest transforms with esbuild, so a decorated class imported in a test hits the rule above.
          Add Babel to the test transform and the whole application boots in-memory, handlers,
          services, error handlers and routes included:
        </p>
        <Code file='vitest.config.ts'>{`import babel from 'vite-plugin-babel'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    babel({
      filter: /\\.[jt]sx?$/,
      babelConfig: {
        babelrc: false,
        configFile: false,
        presets: ['@babel/preset-typescript'],
        plugins: [['@babel/plugin-proposal-decorators', { version: '2023-11' }]]
      }
    })
  ]
})`}</Code>
        <Callout kind='note' title='esbuild alone is fine, the flag is what forces Babel back in'>
          esbuild 0.25 and later implement 2023-11 decorators correctly, metadata included. Without
          <code> experimentalDecorators</code>, decorated classes work under esbuild with no Babel at
          all. It is the compiler flag, imposed by the published typings, that requires the Babel
          step. Typing the decorator factories as 2023-11 so the flag can disappear is tracked as the
          real fix.
        </Callout>
        <H3>Checking metadata by hand</H3>
        <p>
          Metadata keys are <strong>symbols</strong>, so <code>JSON.stringify</code> hides them:
          <code> JSON.stringify(MyClass[Symbol.metadata])</code> prints <code>{'{}'}</code> even when
          everything is correct. Use <code>Reflect.ownKeys()</code> instead.
        </p>
        <Code file='node' lang='js'>{`Reflect.ownKeys(MyClass[Symbol.metadata] ?? {})   // the real keys
JSON.stringify(MyClass[Symbol.metadata])          // always "{}" — do not trust it`}</Code>
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

        <H2>Translations answer their own keys</H2>
        <p>
          <code>t('SOME_KEY')</code> returns <code>SOME_KEY</code>. Nothing failed, which is the whole
          problem: it reads like a missing entry rather than a missing module, and it survives every
          in-process test. The application says so at boot now, and the causes are worth knowing in
          order.
        </p>
        <PropsTable nameHeader='Cause' rows={[
          { name: 'A configuration replaced the bucket', type: 'most common', desc: "blueprint.set('stone.i18n', { … }) overwrites what the build injected. Set keys one at a time: stone.i18n.locale." },
          { name: 'The scan found nothing', type: '', desc: 'Catalogs must sit at <root>/**/i18n/<locale>/<namespace>.json. The build line says how many it found.' },
          { name: 'The build plugin did not run', type: '', desc: '@stone-js/i18n must be a direct dependency of the app being built, and stone.builder.autoDiscover must not be false.' },
          { name: 'Locales are unknown', type: 'wrong language', desc: 'Negotiation is skipped when the list is empty, so every caller gets the fallback. The build declares it; check the line it prints.' }
        ]} />

        <H2><code>Unknown file extension ".ts"</code> when running tests</H2>
        <p>
          Discovery imports your application's modules at run time, and an installed package doing that
          sits outside the runner's transform, so Node is asked to load a <code>.ts</code> file directly.
          {' '}<code>stone test</code> inlines the framework in the config it generates, which is what
          puts those imports back through the transform. If you maintain your own Vitest config, keep
          {' '}<code>server.deps.inline</code> with <code>'@stone-js/'</code> in it, as a string and not
          a regular expression: the generated config is written as JSON, where a{' '}
          <code>RegExp</code> becomes <code>{'{}'}</code> and the runner then finds no tests at all.
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
