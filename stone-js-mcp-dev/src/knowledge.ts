import { BestPractice, Concept, Gap, KnowledgeBase, ModuleInfo } from './declarations'

const concepts: Concept[] = [
  { id: 'continuum', title: 'Continuum Architecture', summary: 'An application is not an artefact but an act: Application = Domain × Context → Resolution. Stone.js IS the context: you write your domain once and the context applies to it at runtime. Focus on your domain during development; choose where to deploy at the end.' },
  { id: 'domain-vs-context', title: 'Domain vs Context', summary: 'The domain is your business logic (handlers, services). The context is the execution environment (HTTP, CLI, browser, edge, MCP). Stone.js owns the context so a single domain runs in any of them — backend, frontend, and mobile later.' },
  { id: 'blueprint', title: 'Blueprint (Setup)', summary: 'A single configuration manifest built once before any event, by introspecting decorators or via imperative meta-modules. All configuration lives under dotted `stone.*` keys.' },
  { id: 'kernel', title: 'Kernel (Initialization)', summary: 'Applies the container (an ephemeral per-event execution context) and the domain to the intention; runs middleware, hooks and error handlers. The micro-kernel depends only on pipeline, service-container and config.' },
  { id: 'adapter', title: 'Adapter (Integration)', summary: 'One package per platform. Captures raw causes, normalises them into intentions (IncomingEvent), and turns responses back into native effects. The adapter is the only long-lived, shared, launched-once thing.' },
  { id: 'ephemeral-context', title: 'Ephemeral per-request context', summary: 'Each request creates a fresh container (a new ephemeral context) via the kernel — totally isolated, never shared between requests. App-lifetime state belongs in a shared scope (a module-level singleton, a cache, or the adapter), not the container.' },
  { id: 'two-paradigms', title: 'Two paradigms at parity', summary: 'Declarative (TC39 stage-3 decorators, Symbol.metadata) and imperative (define* helpers → meta-modules). Both are first-class and 1:1. Three forms everywhere: class, factory, function (the function form never receives the container).' },
  { id: 'service-container', title: 'Service container (DI)', summary: 'A Proxy-based container whose `get` auto-wires dependencies from a destructured constructor (`constructor ({ logger, telemetry })`). Register services as class, factory (singleton optional), never the function form for providers.' },
  { id: 'service-provider', title: 'Service provider', summary: 'Registers services/bindings into the container during kernel init. Modules contribute providers via their blueprint; nothing depends back on the core (micro-kernel).' },
  { id: 'middleware', title: 'Middleware & hooks', summary: 'A chain-of-responsibility pipeline wraps event handling (global > local priority). Lifecycle hooks (onInit, onEvent, onTerminate, …) let modules observe the flow without coupling.' }
]

const modules: ModuleInfo[] = [
  { package: '@stone-js/pipeline', summary: 'Chain-of-responsibility primitive.', tier: 'primitive' },
  { package: '@stone-js/service-container', summary: 'Proxy-based dependency-injection container.', tier: 'primitive' },
  { package: '@stone-js/config', summary: 'Dotted-key blueprint store.', tier: 'primitive' },
  { package: '@stone-js/core', summary: 'The micro-kernel: blueprint, kernel, adapter base, lifecycle.', tier: 'core' },
  { package: '@stone-js/http-core', summary: 'Runtime-agnostic HTTP primitives (events, responses, cookies).', tier: 'crosscutting' },
  { package: '@stone-js/router', summary: 'Universal router (node & browser).', tier: 'crosscutting' },
  { package: '@stone-js/env', summary: 'Environment access with masking.', tier: 'crosscutting' },
  { package: '@stone-js/filesystem', summary: 'Filesystem + file abstractions.', tier: 'crosscutting' },
  { package: '@stone-js/browser-core', summary: 'Browser-side primitives.', tier: 'crosscutting' },
  { package: '@stone-js/node-http-adapter', summary: 'Node HTTP server adapter.', tier: 'adapter' },
  { package: '@stone-js/node-cli-adapter', summary: 'Node CLI adapter.', tier: 'adapter' },
  { package: '@stone-js/aws-lambda-adapter', summary: 'Generic AWS Lambda adapter.', tier: 'adapter' },
  { package: '@stone-js/aws-lambda-http-adapter', summary: 'AWS Lambda HTTP (API GW v1/v2, ALB) adapter.', tier: 'adapter' },
  { package: '@stone-js/browser-adapter', summary: 'Browser SPA adapter.', tier: 'adapter' },
  { package: '@stone-js/fetch-adapter', summary: 'Web-standard (WinterCG) adapter: one build → Cloudflare/Deno/Bun/Vercel/Netlify edge.', tier: 'adapter' },
  { package: '@stone-js/use-react', summary: 'React view engine (CSR/SSR/SSG).', tier: 'frontend' },
  { package: '@stone-js/use-view', summary: 'Agnostic view-engine layer.', tier: 'frontend' },
  { package: '@stone-js/telemetry', summary: 'Spans/counters/gauges via hooks + middleware, pluggable exporters.', tier: 'extension' },
  { package: '@stone-js/validation', summary: 'One schema (Zod/Standard Schema) validated backend AND frontend.', tier: 'extension' },
  { package: '@stone-js/auth', summary: 'Edge-native, stateless JWT/OAuth (jose).', tier: 'extension' },
  { package: '@stone-js/authz', summary: 'Isomorphic RBAC+ABAC authorization (CASL).', tier: 'extension' },
  { package: '@stone-js/resources', summary: 'API resources: shape the exposed output, decoupled from controllers.', tier: 'extension' },
  { package: '@stone-js/openapi', summary: 'Derive an OpenAPI contract from Zod schemas + routes.', tier: 'extension' },
  { package: '@stone-js/testing', summary: 'Boot an app in-memory and dispatch events through the kernel.', tier: 'extension' },
  { package: '@stone-js/mcp-dev', summary: 'Serve the framework knowledge + your tools to a coding agent via `stone mcp` (MCP, stdio).', tier: 'tooling' },
  { package: '@stone-js/cli', summary: 'Build tooling (Rollup+Babel backend, Vite+Babel frontend, codegen).', tier: 'tooling' },
  { package: '@stone-js/create', summary: 'Scaffolder: npm create @stone-js.', tier: 'tooling' }
]

const bestPractices: BestPractice[] = [
  { rule: 'Keep every module core platform-agnostic (no window/process/fs); add platform drivers/adapters around it.', why: 'A single domain must run backend, frontend and (later) mobile.' },
  { rule: 'Use TC39 stage-3 decorators (Symbol.metadata). Never enable experimentalDecorators or reflect-metadata.', why: 'Setting experimentalDecorators flips esbuild/tsc to legacy decorators and breaks method decorators; the CLI builds with Babel stage-3.' },
  { rule: 'Configure everything via dotted stone.* keys on the blueprint.', why: 'One uniform, introspectable configuration surface.' },
  { rule: 'Expose class, factory and function forms; the function form never receives the container.', why: 'Two paradigms at parity, DI only where it makes sense.' },
  { rule: 'Private/protected constructor + static create().', why: 'Controlled construction across the framework.' },
  { rule: 'Declare internal @stone-js/* deps as workspace:* in the monorepo.', why: 'Avoids resolving stale published versions (a real source of breakage).' },
  { rule: 'Put app-lifetime state in a shared scope (module-level singleton, cache, adapter), never in the per-request container.', why: 'The container is a fresh ephemeral context per request — it cannot and must not persist across requests.' },
  { rule: 'Every bug fix earns a behavioural test (not a mock test); target 100% coverage.', why: 'Prove behaviour, not implementation.' },
  { rule: 'Attach request-scoped state via setMetadataValue/getMetadataValue; the principal via setUserResolver.', why: 'The idiomatic per-event carriers.' }
]

const gaps: Gap[] = [
  { name: 'queue/jobs', status: 'planned', note: 'Background jobs (in-memory, Redis/BullMQ, SQS, Cloud Tasks).' },
  { name: 'cache', status: 'planned', note: 'Agnostic cache (memory, Redis, CF KV) — the legitimate shared scope.' },
  { name: 'mail/notifications', status: 'planned', note: 'Multi-channel notifications.' },
  { name: 'rate-limiting', status: 'planned', note: 'Edge-friendly throttling.' },
  { name: 'i18n', status: 'planned', note: 'Runtime localization.' },
  { name: 'websocket/realtime', status: 'planned', note: 'Channels/rooms/presence, agnostic drivers.' },
  { name: 'cloud file drivers', status: 'planned', note: 'S3/R2/GCS drivers extending @stone-js/filesystem.' },
  { name: 'ORM', status: 'missing', note: 'By design: integrate Drizzle/Prisma/Kysely via providers — Stone.js will not ship an ORM.' }
]

/**
 * The single, curated, machine-readable map of Stone.js. Kept concise and accurate so an agent
 * can consult it in real time instead of scanning every package.
 */
export const knowledgeBase: KnowledgeBase = {
  name: 'Stone.js',
  tagline: 'Focus on your domain. Stone.js is the context. Build once, deploy anywhere.',
  version: '0.8.0',
  concepts,
  modules,
  bestPractices,
  gaps
}

/**
 * Find a concept by id (case-insensitive).
 *
 * @param id - The concept id.
 * @returns The concept, or undefined.
 */
export function getConcept (id: string): Concept | undefined {
  return knowledgeBase.concepts.find((concept) => concept.id === id.toLowerCase())
}

/**
 * Full-text search across concepts, modules, best-practices and gaps.
 *
 * @param query - The search terms.
 * @returns Matching entries with their kind.
 */
export function searchKnowledge (query: string): Array<{ kind: string, title: string, text: string }> {
  const q = query.trim().toLowerCase()
  if (q.length === 0) { return [] }

  const results: Array<{ kind: string, title: string, text: string }> = []
  const match = (text: string): boolean => text.toLowerCase().includes(q)

  for (const c of knowledgeBase.concepts) {
    if (match(c.id) || match(c.title) || match(c.summary)) { results.push({ kind: 'concept', title: c.title, text: c.summary }) }
  }
  for (const m of knowledgeBase.modules) {
    if (match(m.package) || match(m.summary)) { results.push({ kind: 'module', title: m.package, text: m.summary }) }
  }
  for (const b of knowledgeBase.bestPractices) {
    if (match(b.rule) || match(b.why)) { results.push({ kind: 'best-practice', title: b.rule, text: b.why }) }
  }
  for (const g of knowledgeBase.gaps) {
    if (match(g.name) || match(g.note)) { results.push({ kind: 'gap', title: g.name, text: g.note }) }
  }

  return results
}
