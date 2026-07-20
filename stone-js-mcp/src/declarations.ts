/** A core architectural concept of Stone.js. */
export interface Concept {
  /** Slug id (e.g. `continuum`). */
  id: string
  /** Human title. */
  title: string
  /** One-paragraph explanation. */
  summary: string
}

/** A module of the ecosystem. */
export interface ModuleInfo {
  /** npm package name. */
  package: string
  /** One-line description. */
  summary: string
  /** Where it sits in the architecture. */
  tier: 'primitive' | 'core' | 'crosscutting' | 'adapter' | 'frontend' | 'extension' | 'tooling'
}

/** A framework convention (with its rationale). */
export interface BestPractice {
  /** The rule. */
  rule: string
  /** Why it exists. */
  why: string
}

/** Something the framework does not (yet) provide. */
export interface Gap {
  /** The capability. */
  name: string
  /** `planned` (on the roadmap) or `missing` (integrate a third party). */
  status: 'planned' | 'missing'
  /** Guidance. */
  note: string
}

/** The machine-readable map of Stone.js. */
export interface KnowledgeBase {
  name: string
  tagline: string
  version: string
  concepts: Concept[]
  modules: ModuleInfo[]
  bestPractices: BestPractice[]
  gaps: Gap[]
}

/**
 * A tool definition, structurally compatible with `@stone-js/mcp-adapter`'s `McpTool` — so the
 * exported tools plug straight into `defineMcpTools()` without a hard dependency.
 */
export interface McpToolDef {
  name: string
  description?: string
  inputSchema?: Record<string, unknown>
  handler: (args: Record<string, unknown>) => unknown | Promise<unknown>
}
