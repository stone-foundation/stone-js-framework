/**
 * The ecosystem catalogue: the single source of truth for the top-level /ecosystem page AND the
 * docs catalog. Grouped by role in the architecture. Adapters and extensions carry a `href` to
 * their documentation page (they are the products); the infrastructure tiers are shown for context.
 */

export interface CatalogModule {
  name: string
  desc: string
  /** Docs page, when the module has a dedicated one. */
  href?: string
}

export interface CatalogTier {
  tier: string
  blurb: string
  modules: CatalogModule[]
}

export const CATALOG: CatalogTier[] = [
  {
    tier: 'Primitives',
    blurb: 'The three dependencies the kernel is built on. Nothing else.',
    modules: [
      { name: '@stone-js/pipeline', desc: 'The chain of responsibility every event flows through.' },
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
      { name: '@stone-js/router', desc: 'Universal routing for server and browser, plus the light key-router.', href: '/docs/routing' },
      { name: '@stone-js/env', desc: 'Typed, validated environment access.' },
      { name: '@stone-js/filesystem', desc: 'File access abstracted from the platform.' },
      { name: '@stone-js/browser-core', desc: 'The browser runtime primitives.' }
    ]
  },
  {
    tier: 'Adapters',
    blurb: 'Integration. Each turns one platform cause into an intention, deploy anywhere.',
    modules: [
      { name: '@stone-js/node-http-adapter', desc: 'Production HTTP server on Node.', href: '/docs/adapters/node-http' },
      { name: '@stone-js/node-cli-adapter', desc: 'Your handlers, invoked as CLI commands.', href: '/docs/adapters/node-cli' },
      { name: '@stone-js/node-ws-adapter', desc: 'A ws server bridging sockets to realtime.', href: '/docs/adapters/node-ws' },
      { name: '@stone-js/aws-lambda-adapter', desc: 'Generic AWS Lambda integration, beyond HTTP.', href: '/docs/adapters/aws-lambda' },
      { name: '@stone-js/aws-apigw-ws-adapter', desc: 'Serverless realtime on API Gateway WebSockets.', href: '/docs/adapters/aws-apigw-ws' },
      { name: '@stone-js/gcp-cloud-functions-adapter', desc: 'Google Cloud Functions, HTTP and events.', href: '/docs/adapters/gcp-cloud-functions' },
      { name: '@stone-js/azure-functions-adapter', desc: 'Azure Functions, HTTP and events.', href: '/docs/adapters/azure-functions' },
      { name: '@stone-js/alibaba-fc-adapter', desc: 'Alibaba Cloud Function Compute.', href: '/docs/adapters/alibaba-fc' },
      { name: '@stone-js/tencent-scf-adapter', desc: 'Tencent Cloud Serverless Cloud Functions.', href: '/docs/adapters/tencent-scf' },
      { name: '@stone-js/fetch-adapter', desc: 'One Web-standard adapter: Cloudflare, Deno, Bun, Vercel, Netlify.', href: '/docs/adapters/fetch' },
      { name: '@stone-js/browser-adapter', desc: 'Run the app in the browser (SPA, hydration).', href: '/docs/adapters/browser' }
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
    blurb: 'Opt-in capabilities that graft onto the kernel through blueprints. This is the toolbox.',
    modules: [
      { name: '@stone-js/validation', desc: 'One schema, enforced on the API and the form.', href: '/docs/extensions/validation' },
      { name: '@stone-js/auth', desc: 'Stateless JWT / OAuth, edge-native, no session.', href: '/docs/extensions/auth' },
      { name: '@stone-js/authz', desc: 'Isomorphic RBAC + ABAC: one rule set, API and UI.', href: '/docs/extensions/authorization' },
      { name: '@stone-js/resources', desc: 'Deliberate projections from model to public shape.', href: '/docs/extensions/resources' },
      { name: '@stone-js/cloud-file', desc: 'File storage over S3, GCS and Azure Blob, with signed URLs.', href: '/docs/extensions/cloud-file' },
      { name: '@stone-js/cache', desc: 'Memory and Redis caching with a single API.', href: '/docs/extensions/cache' },
      { name: '@stone-js/queue', desc: 'Dispatch now or later, process with a worker, retry with backoff.', href: '/docs/extensions/queue' },
      { name: '@stone-js/realtime', desc: 'One Broadcaster API, backend and frontend: channels and presence.', href: '/docs/extensions/realtime' },
      { name: '@stone-js/event-bus', desc: 'Emit domain events to local and cloud targets; route them anywhere.', href: '/docs/extensions/event-bus' },
      { name: '@stone-js/config-source', desc: 'Load config from env, files, SSM, Secrets Manager, HTTP and KMS.', href: '/docs/extensions/config-source' },
      { name: '@stone-js/openapi', desc: 'A public contract derived from your schemas.', href: '/docs/extensions/openapi' },
      { name: '@stone-js/testing', desc: 'Boot the real app in memory; dispatch real events.', href: '/docs/extensions/testing' },
      { name: '@stone-js/mcp-dev', desc: 'Serve the framework knowledge + your app to a coding agent via `stone mcp`.', href: '/docs/extensions/mcp' }
    ]
  },
  {
    tier: 'Tooling',
    blurb: 'Build, scaffold, start.',
    modules: [
      { name: '@stone-js/cli', desc: 'Builds every project type; codegen into .stone/.' },
      { name: '@stone-js/create', desc: 'npm create @stone-js: the scaffolder.' },
      { name: '@stone-js/starters', desc: 'Templates for each context.', href: '/starters' }
    ]
  }
]
