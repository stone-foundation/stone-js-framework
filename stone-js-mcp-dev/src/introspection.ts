import { IBlueprint } from '@stone-js/core'
import { McpToolDef } from './declarations'

/** Keys whose values are redacted from any config dump (env secrets, credentials). */
const SECRET_KEY = /(secret|token|password|passwd|api[_-]?key|credential|private|passphrase|auth)/i

/** How deep {@link sanitize} walks before bailing out. */
const MAX_DEPTH = 6

/**
 * Best-effort name of a module reference (class, function, or meta-module `{ module }`).
 *
 * @param value - The reference to name.
 * @returns The resolved name.
 */
export function moduleName (value: unknown): string {
  if (value === undefined || value === null) { return 'unknown' }
  if (typeof value === 'string') { return value }
  if (typeof value === 'function') { return value.name.length > 0 ? value.name : 'anonymous' }
  if (typeof value === 'object') {
    const meta = value as { module?: unknown, name?: unknown }
    if (meta.module !== undefined) { return moduleName(meta.module) }
    if (typeof meta.name === 'string') { return meta.name }
  }
  return 'unknown'
}

/**
 * Produce a JSON-safe, secret-redacted copy of a config value: functions/classes become a label,
 * `RegExp` its source, secret-looking keys `[redacted]`, and recursion is depth-capped.
 *
 * @param value - The value to sanitize.
 * @param depth - The current recursion depth.
 * @returns A serializable value.
 */
export function sanitize (value: unknown, depth: number = 0): unknown {
  if (depth > MAX_DEPTH) { return '[max-depth]' }
  if (value === undefined || value === null) { return value }
  if (typeof value === 'function') { return `[Function: ${value.name.length > 0 ? value.name : 'anonymous'}]` }
  if (value instanceof RegExp) { return value.toString() }
  if (Array.isArray(value)) { return value.map((item) => sanitize(item, depth + 1)) }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = SECRET_KEY.test(key) ? '[redacted]' : sanitize(val, depth + 1)
    }
    return out
  }
  return value
}

/** Remove `undefined` and empty arrays from an object, so tool output stays terse. */
function clean (obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) { continue }
    if (Array.isArray(val) && val.length === 0) { continue }
    out[key] = val
  }
  return out
}

/** Map a route definition (and its children) to a terse, serializable shape. */
function mapRoute (def: Record<string, unknown>): Record<string, unknown> {
  const methods = def.methods ?? (def.method !== undefined ? [def.method] : undefined)
  const children = (def.children as Array<Record<string, unknown>> | undefined) ?? []
  const middleware = (def.middleware as unknown[] | undefined) ?? []
  return clean({
    name: def.name,
    methods,
    path: def.path,
    handler: def.handler !== undefined ? moduleName(def.handler) : undefined,
    middleware: middleware.map(moduleName),
    children: children.map(mapRoute)
  })
}

/** Count routes across the definition tree. */
function countRoutes (defs: Array<Record<string, unknown>>): number {
  return defs.reduce((total, def) => {
    const children = (def.children as Array<Record<string, unknown>> | undefined) ?? []
    return total + 1 + countRoutes(children)
  }, 0)
}

/**
 * Build the read-only introspection tools bound to the app's resolved blueprint.
 *
 * These expose what the app actually declares (routes, commands, adapters, providers, kernel
 * pipeline, config) so a coding agent understands *this* app, not just the framework. They read
 * only, never mutate, and redact secret-looking config values.
 *
 * @param blueprint - The resolved application blueprint.
 * @returns The introspection tools.
 */
export function createIntrospectionTools (blueprint: IBlueprint): McpToolDef[] {
  const routes = (): Array<Record<string, unknown>> => blueprint.get('stone.router.definitions', [])
  const commands = (): Array<{ options?: Record<string, unknown> }> => blueprint.get('stone.adapter.commands', [])

  return [
    {
      name: 'stone_app',
      description: 'Summarize the current Stone.js app: name, env, active platform, and counts of routes/commands/providers/adapters.',
      handler: () => clean({
        name: blueprint.get('stone.name'),
        env: blueprint.get('stone.env'),
        platform: blueprint.get('stone.adapter.platform'),
        counts: {
          routes: countRoutes(routes()),
          commands: commands().length,
          providers: blueprint.get<unknown[]>('stone.providers', []).length,
          adapters: blueprint.get<unknown[]>('stone.adapters', []).length
        }
      })
    },
    {
      name: 'stone_routes',
      description: 'List the app\'s routes (path, methods, name, handler, middleware) as declared on the router.',
      handler: () => routes().map(mapRoute)
    },
    {
      name: 'stone_commands',
      description: 'List the app\'s CLI commands (name, alias, args, description).',
      handler: () => commands().map((c) => clean({
        name: c.options?.name,
        alias: c.options?.alias,
        args: c.options?.args,
        desc: c.options?.desc
      }))
    },
    {
      name: 'stone_adapters',
      description: 'List the registered adapters (platform, alias, default/current) and the active platform.',
      handler: () => ({
        active: blueprint.get('stone.adapter.platform'),
        adapters: blueprint.get<Array<Record<string, unknown>>>('stone.adapters', []).map((a) => clean({
          platform: a.platform,
          alias: a.alias,
          current: a.current,
          default: a.default
        }))
      })
    },
    {
      name: 'stone_providers',
      description: 'List the app\'s service providers.',
      handler: () => blueprint.get<unknown[]>('stone.providers', []).map(moduleName)
    },
    {
      name: 'stone_kernel',
      description: 'Show the kernel pipeline: the event handler, middleware, and registered error handlers.',
      handler: () => {
        const kernel = blueprint.get<Record<string, unknown>>('stone.kernel', {})
        return clean({
          eventHandler: kernel.eventHandler !== undefined ? moduleName(kernel.eventHandler) : undefined,
          middleware: ((kernel.middleware as unknown[] | undefined) ?? []).map(moduleName),
          errorHandlers: Object.keys((kernel.errorHandlers as Record<string, unknown> | undefined) ?? {})
        })
      }
    },
    {
      name: 'stone_key_routes',
      description: 'List the key-routing definitions (event-bus / realtime / keyed events): key to handler.',
      handler: () => blueprint.get<Array<Record<string, unknown>>>('stone.keyRouting.definitions', []).map((d) => clean({
        key: d.key,
        action: d.action,
        handler: d.module !== undefined ? moduleName(d.module) : undefined
      }))
    },
    {
      name: 'stone_config',
      description: 'Read a resolved config value by dotted key under `stone.*` (secrets redacted). Omit `key` to list the top-level `stone` keys.',
      handler: (args) => {
        const key = String(args.key ?? '')
        if (key.length === 0) { return Object.keys(blueprint.get<Record<string, unknown>>('stone', {})) }
        return sanitize(blueprint.get(key))
      }
    }
  ]
}
