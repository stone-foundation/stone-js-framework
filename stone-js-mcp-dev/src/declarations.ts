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
 * A tool definition exposed to the agent over MCP. The `handler` runs in-process (the dev server
 * hands the SDK the callback directly): these are framework-knowledge and dev helpers, not your
 * domain, so they do not traverse the kernel.
 */
export interface McpToolDef {
  name: string
  description?: string
  inputSchema?: Record<string, unknown>
  handler: (args: Record<string, unknown>) => unknown
}

/**
 * Options for the GitHub report tools: open a bug/feature issue straight from the dev loop.
 */
export interface ReportToolsOptions {
  /** GitHub token with `issues:write` on the target repo. */
  token: string
  /** Target repository as `owner/repo`. */
  repo: string
  /** Injectable fetch (defaults to the global). Mainly for testing. */
  fetch?: typeof fetch
}

/**
 * A logger for the dev server's activity. It writes to **stderr** so stdout stays reserved for the
 * MCP protocol (stdio transport speaks JSON-RPC on stdout — any other write there corrupts it).
 */
export type McpDevLogger = (message: string) => void

/**
 * Minimal yargs builder surface used to declare the command's options. Re-declared locally so the
 * package stays decoupled from `@stone-js/node-cli-adapter` (the CLI adapter passes the real
 * yargs builder at run time; this only shapes the callback).
 */
export interface IArgv {
  option: (name: string, options: { type?: string, alias?: string, desc?: string, default?: unknown }) => IArgv
  positional: (name: string, options: Record<string, unknown>) => IArgv
}

/**
 * CLI command options, structurally compatible with `@stone-js/node-cli-adapter`'s `CommandOptions`.
 */
export interface CommandOptions {
  name: string
  alias?: string | string[]
  args?: string | string[]
  desc?: string
  options?: (yargs: IArgv) => IArgv
}

/**
 * Options for the MCP dev server, exposed on the blueprint under `stone.mcpDev`.
 *
 * `stone mcp` starts an MCP server (stdio) that hands the SDK the built-in framework-knowledge
 * tools merged with yours, and logs every tool call to stderr so you watch the agent think.
 */
export interface McpDevOptions {
  /** The MCP server name advertised to the agent. */
  name?: string
  /** The MCP server version. */
  version?: string
  /** The `instructions` string advertised to the agent (the Continuum contract). */
  instructions?: string
  /** Your own tools, merged with the built-in framework-knowledge tools. */
  tools?: McpToolDef[]
  /** Enable the GitHub bug/feature report tools by passing a token + repo. */
  report?: ReportToolsOptions
  /** Silence the stderr activity log. */
  quiet?: boolean
}
