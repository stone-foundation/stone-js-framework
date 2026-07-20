import { JSX } from 'react'
import { siblings } from '../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Pager } from '../components/content'

const PATH = '/docs/ecosystem'

interface Module { name: string, desc: string }
interface Tier { tier: string, blurb: string, modules: Module[] }

/** The catalog, grouped by role in the architecture. */
const CATALOG: Tier[] = [
  {
    tier: 'Primitives',
    blurb: 'The three dependencies the kernel is built on. Nothing else.',
    modules: [
      { name: '@stone-js/pipeline', desc: 'The chain of responsibility every request flows through.' },
      { name: '@stone-js/service-container', desc: 'Dependency injection: the ephemeral, per-event container.' },
      { name: '@stone-js/config', desc: 'The Blueprint store, addressed by dotted stone.* keys.' }
    ]
  },
  {
    tier: 'Kernel',
    blurb: 'The platform-agnostic center. Knows nothing of HTTP, CLI or the browser.',
    modules: [
      { name: '@stone-js/core', desc: 'Blueprint builder, kernel, lifecycle, hooks, error handling.' }
    ]
  },
  {
    tier: 'Layers',
    blurb: 'Cross-cutting capabilities, agnostic of the runtime.',
    modules: [
      { name: '@stone-js/http-core', desc: 'The runtime-agnostic HTTP request/response model.' },
      { name: '@stone-js/router', desc: 'Universal routing for server and browser.' },
      { name: '@stone-js/env', desc: 'Typed, validated environment access.' },
      { name: '@stone-js/filesystem', desc: 'File access abstracted from the platform.' },
      { name: '@stone-js/browser-core', desc: 'The browser runtime primitives.' }
    ]
  },
  {
    tier: 'Adapters',
    blurb: 'Integration. Each turns one platform cause into an intention.',
    modules: [
      { name: '@stone-js/node-http-adapter', desc: 'Production HTTP server on Node.' },
      { name: '@stone-js/node-cli-adapter', desc: 'Your handlers, invoked as CLI commands.' },
      { name: '@stone-js/aws-lambda-adapter', desc: 'Generic AWS Lambda integration.' },
      { name: '@stone-js/aws-lambda-http-adapter', desc: 'API Gateway / Lambda HTTP events.' },
      { name: '@stone-js/fetch-adapter', desc: 'One Web-standard adapter: Cloudflare, Deno, Bun, Vercel, Netlify.' },
      { name: '@stone-js/browser-adapter', desc: 'Run the app in the browser (SPA, hydration).' },
      { name: '@stone-js/mcp-adapter', desc: 'Expose your domain to AI agents as MCP tools.' }
    ]
  },
  {
    tier: 'Frontend',
    blurb: 'The view dimension.',
    modules: [
      { name: '@stone-js/use-react', desc: 'React pages and layouts, CSR / SSR / SSG.' },
      { name: '@stone-js/use-view', desc: 'The framework-agnostic view engine under use-react.' }
    ]
  },
  {
    tier: 'Extensions',
    blurb: 'Opt-in capabilities that graft onto the kernel through blueprints.',
    modules: [
      { name: '@stone-js/validation', desc: 'One schema, enforced on the API and the form.' },
      { name: '@stone-js/auth', desc: 'Stateless JWT / OAuth, edge-native, no session.' },
      { name: '@stone-js/authz', desc: 'Isomorphic RBAC + ABAC: one rule set, API and UI.' },
      { name: '@stone-js/resources', desc: 'Deliberate projections from model to public shape.' },
      { name: '@stone-js/openapi', desc: 'A public contract derived from your schemas.' },
      { name: '@stone-js/testing', desc: 'Boot the real app in memory; dispatch real events.' },
      { name: '@stone-js/mcp', desc: 'An MCP server for the framework itself, for coding agents.' }
    ]
  },
  {
    tier: 'Tooling',
    blurb: 'Build, scaffold, start.',
    modules: [
      { name: '@stone-js/cli', desc: 'Builds every project type; codegen into .stone/.' },
      { name: '@stone-js/create', desc: 'npm create @stone-js: the scaffolder.' },
      { name: '@stone-js/starters', desc: 'Templates for each context.' }
    ]
  }
]

/**
 * Ecosystem: the marketplace, grouped by role.
 */
@Page(PATH, { layout: 'docs' })
export class Ecosystem implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Ecosystem',
      description: 'A keystone kernel with three dependencies; everything else, adapters and extensions, plugs in through blueprints. Browse the catalog.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Ecosystem' title='A keystone kernel. Everything else plugs in.' />
        <Lead>
          The core depends on three primitives and nothing more. Every other package, adapters and
          extensions alike, grafts onto it through a blueprint, never the other way around. That is
          why the catalog can grow without the center ever changing.
        </Lead>

        {CATALOG.map((group) => (
          <section key={group.tier} className='market-group'>
            <H2>{group.tier}</H2>
            <p className='market-blurb'>{group.blurb}</p>
            <div className='market-grid'>
              {group.modules.map((m) => (
                <div key={m.name} className='market-card'>
                  <p className='mc-name'>{m.name}</p>
                  <p className='mc-desc'>{m.desc}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <Callout kind='future' title='The catalog is open'>
          Because adapters and extensions attach through blueprints, a community package sits beside
          a first-party one with no privileged access and no core change. The next capability, and
          the next runtime, can come from anyone.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
