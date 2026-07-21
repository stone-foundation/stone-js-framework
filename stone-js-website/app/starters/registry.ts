/**
 * The starters registry: the single source of truth for the /starters catalogue
 * AND the ready repos the blog recipes install. First-party starters are listed
 * here; third parties add their own via a PR that appends an entry with
 * `official: false`. Everything on the site is rendered from this data.
 */

export type StarterTarget = 'backend' | 'frontend' | 'edge' | 'full'
export type StarterParadigm = 'decorators' | 'define*' | 'both'

export interface Starter {
  /** Stable id, also the `--starters <id>` value. */
  id: string
  title: string
  /** First-party (Stone Foundation) vs third-party. */
  official: boolean
  target: StarterTarget
  paradigm: StarterParadigm
  /** Short problem tag, e.g. "starter", "file-upload", "realtime". */
  problem: string
  /** The scaffold command (copied from the card). */
  command: string
  /** Source repository. */
  repo: string
  author: string
  authorUrl?: string
  /** One line, shown collapsed on the card (expands on click). */
  description: string
  /** Deeper description shown in the "About" modal. */
  about: string
  /** The blog recipe that ships this starter, if any. */
  blogSlug?: string
}

const GH = 'https://github.com/stone-foundation'
const cmd = (id: string): string => `npm create @stone-js@latest my-app --starters ${id}`

const TIERS = {
  basic: 'the minimal skeleton: routing over HTTP, wired and ready to run, nothing to remove.',
  standard: 'a real starting point: routing, middleware and config in the idiomatic layout.',
  full: 'the fullest scaffold: adds the filesystem, environment config and a CLI console alongside the HTTP server, with the testing setup in place.'
} as const

/** Generate the first-party matrix: tier x kind x paradigm. */
function official (): Starter[] {
  const kinds = [
    { kind: 'react', target: 'frontend' as StarterTarget, label: 'React', what: 'a React app (SSR/SSG)' },
    { kind: 'service', target: 'backend' as StarterTarget, label: 'Service', what: 'a backend service' }
  ]
  const paras = [
    { key: 'declarative', paradigm: 'decorators' as StarterParadigm, label: 'Decorators' },
    { key: 'imperative', paradigm: 'define*' as StarterParadigm, label: 'define*' }
  ]
  const out: Starter[] = []
  for (const tier of ['basic', 'standard', 'full'] as const) {
    for (const k of kinds) {
      for (const p of paras) {
        const id = `${tier}-${k.kind}-${p.key}`
        out.push({
          id,
          title: `${tier[0].toUpperCase()}${tier.slice(1)} ${k.label} · ${p.label}`,
          official: true,
          target: k.target,
          paradigm: p.paradigm,
          problem: 'starter',
          command: cmd(id),
          repo: `${GH}/stone-js-starters/tree/main/${id}`,
          author: 'Stone Foundation',
          authorUrl: GH,
          description: `Stone.js ${tier} starter for ${k.what}, ${p.label} paradigm.`,
          about: `The ${tier} ${k.label} starter (${p.label} API): ${TIERS[tier]} Build once and deploy the same domain to Node, serverless, the edge or the browser.`
        })
      }
    }
  }
  return out
}

export const STARTERS: Starter[] = [
  {
    id: 'continuum-showcase',
    title: 'Continuum Showcase',
    official: true,
    target: 'full',
    paradigm: 'both',
    problem: 'showcase',
    command: cmd('continuum-showcase'),
    repo: `${GH}/stone-js-starters/tree/main/continuum-showcase`,
    author: 'Stone Foundation',
    authorUrl: GH,
    description: 'The full Continuum tour: one domain running across every context.',
    about: 'A guided showcase of the Continuum Architecture: the same domain served over HTTP, on the edge, as a CLI and as agent tools, with both paradigms side by side. The best place to feel "your app exists in every runtime, until you run it".',
    blogSlug: 'one-domain-three-runtimes'
  },
  {
    id: 'realtime-chat',
    title: 'Realtime chat',
    official: true,
    target: 'backend',
    paradigm: 'decorators',
    problem: 'realtime',
    command: 'npm create @stone-js@latest my-app --starters github:stone-foundation/stone-js-blog-starters',
    repo: `${GH}/stone-js-blog-starters/tree/main/realtime-chat`,
    author: 'Stone Foundation',
    authorUrl: GH,
    description: 'Channels, presence and broadcast over WebSockets, ready to run.',
    about: 'The realtime recipe as a runnable app: @NodeWs bridges sockets to the kernel, @Realtime broadcasts, and a @RealtimeGateway handles connect / disconnect / message. This is an opt-in blog starter kept out of the default listing: request it with --starters github:stone-foundation/stone-js-blog-starters. Switch the driver to redis to scale across nodes; the same gateway runs unchanged on the AWS API Gateway WebSocket adapter.',
    blogSlug: 'real-time-features'
  },
  {
    id: 'multi-tenant',
    title: 'Multi-tenant (subdomain routing)',
    official: true,
    target: 'backend',
    paradigm: 'decorators',
    problem: 'multi-tenant',
    command: 'npm create @stone-js@latest my-app --starters github:stone-foundation/stone-js-blog-starters',
    repo: `${GH}/stone-js-blog-starters/tree/main/multi-tenant`,
    author: 'Stone Foundation',
    authorUrl: GH,
    description: 'Capture the tenant from the subdomain and scope every request to it.',
    about: 'Multi-tenancy as routing: a controller scoped to {tenant}.example.com captures the tenant from the host during matching, and every handler reads it off the event, no header parsing, no lookup middleware. An opt-in blog starter, request it with --starters github:stone-foundation/stone-js-blog-starters.',
    blogSlug: 'multi-tenant-subdomains'
  },
  {
    id: 'isomorphic-validation',
    title: 'Isomorphic validation',
    official: true,
    target: 'backend',
    paradigm: 'decorators',
    problem: 'validation',
    command: 'npm create @stone-js@latest my-app --starters github:stone-foundation/stone-js-blog-starters',
    repo: `${GH}/stone-js-blog-starters/tree/main/isomorphic-validation`,
    author: 'Stone Foundation',
    authorUrl: GH,
    description: 'One schema, enforced at the API boundary and reusable on the form.',
    about: 'Write the shape of the data once as a Zod schema: validate({ body: NewTask }) gates the route and rejects a malformed body with a 422 before the handler runs, while the same schema validates the frontend form, so the API and UI can never drift. An opt-in blog starter, request it with --starters github:stone-foundation/stone-js-blog-starters.',
    blogSlug: 'isomorphic-validation'
  },
  {
    id: 'stateless-auth',
    title: 'Stateless auth',
    official: true,
    target: 'backend',
    paradigm: 'decorators',
    problem: 'auth',
    command: 'npm create @stone-js@latest my-app --starters github:stone-foundation/stone-js-blog-starters',
    repo: `${GH}/stone-js-blog-starters/tree/main/stateless-auth`,
    author: 'Stone Foundation',
    authorUrl: GH,
    description: 'Verify a JWT at the boundary and guard routes, no session store.',
    about: 'Identity established once at the edge: a kernel middleware verifies the Bearer token on every request, then requireAuth() (401) and requireScopes(...) (403) guard routes. Nothing touches a session store, so the same code runs on Node, serverless and the edge. An opt-in blog starter, request it with --starters github:stone-foundation/stone-js-blog-starters.',
    blogSlug: 'stateless-auth-at-the-edge'
  },
  {
    id: 'api-as-tools',
    title: 'API as agent tools',
    official: true,
    target: 'backend',
    paradigm: 'decorators',
    problem: 'agents',
    command: 'npm create @stone-js@latest my-app --starters github:stone-foundation/stone-js-blog-starters',
    repo: `${GH}/stone-js-blog-starters/tree/main/api-as-tools`,
    author: 'Stone Foundation',
    authorUrl: GH,
    description: 'The same domain served over HTTP, exposed to agents as MCP tools.',
    about: 'An AI agent is just another caller. Stack @Mcp() on the app and your existing router handlers are listed to agents as MCP tools, the same domain your REST API serves, with no handler change. stdio by default for a local tool, sse for a remote server. An opt-in blog starter, request it with --starters github:stone-foundation/stone-js-blog-starters.',
    blogSlug: 'api-as-agent-tools'
  },
  ...official()
]

/** Distinct filter values present in the registry. */
export const TARGETS: StarterTarget[] = ['backend', 'frontend', 'edge', 'full']
export const PARADIGMS: StarterParadigm[] = ['decorators', 'define*', 'both']
