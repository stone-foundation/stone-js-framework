import { sanitize } from './introspection'
import { IBlueprint } from '@stone-js/core'
import { dirname, join } from 'node:path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

/** Where a running application leaves its resolved configuration for the MCP server to read. */
export const APP_CONTEXT_FILE: string = join('.stone', 'app-context.json')

/**
 * What a running application publishes about itself.
 */
export interface AppContext {
  /** The platform the application actually booted as. */
  platform?: string
  /** The environment it booted in. */
  env?: string
  /** Its name. */
  name?: string
  /** The resolved `stone` configuration, with secret-looking values redacted. */
  stone: Record<string, unknown>
}

/**
 * A duck-typed reader over a published context, shaped like the blueprint the tools already read.
 *
 * The introspection tools ask questions by dotted key, so a plain object answering `get` is all they
 * need: the same tools then work against a file or against a live blueprint, and neither knows which.
 */
export interface ContextReader {
  get: <T>(key: string, fallback?: T) => T
}

/**
 * Publish an application's resolved configuration.
 *
 * This is what makes `stone mcp` describe the application a developer is actually running. The MCP
 * server is a console command: booting the app itself gives it the *console* platform, so its
 * adapters, its response type and every platform-conditional contribution belong to a different
 * application than the one under `stone dev`. The running app knows the truth, so the running app
 * says it.
 *
 * A file rather than an endpoint, deliberately. The Blueprint is the Setup dimension: assembled once
 * before the first event and then read, so publishing it once at boot is not a snapshot of something
 * moving — it *is* the value. A file also needs no port to discover, no dev-only route in someone's
 * application, no token to protect, and it works for a CLI or an edge context that has no HTTP
 * surface at all. What genuinely moves at run time (a `live` configuration, metrics) is a different
 * question, and belongs to a different tool.
 *
 * @param blueprint - The running application's blueprint.
 * @param cwd - The project root.
 * @returns The file it wrote.
 */
export function publishAppContext (blueprint: IBlueprint, cwd: string = process.cwd()): string {
  const path = join(cwd, APP_CONTEXT_FILE)

  const context: AppContext = {
    platform: blueprint.get<string>('stone.adapter.platform'),
    env: blueprint.get<string>('stone.env'),
    name: blueprint.get<string>('stone.name'),
    stone: sanitize(blueprint.get<Record<string, unknown>>('stone', {})) as Record<string, unknown>
  }

  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(context, null, 2), 'utf-8')

  return path
}

/**
 * Read what a running application published, if it published anything.
 *
 * @param cwd - The project root.
 * @returns The context, or `undefined` when no application has run.
 */
export function readAppContext (cwd: string = process.cwd()): AppContext | undefined {
  const path = join(cwd, APP_CONTEXT_FILE)

  if (!existsSync(path)) { return undefined }

  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as AppContext
  } catch {
    // A half-written or hand-edited file is not worth failing the whole MCP server for: the tools
    // fall back to what the console boot knows, and say so.
    return undefined
  }
}

/**
 * A reader over a published context, answering the same dotted keys a blueprint answers.
 *
 * @param context - The published context.
 * @returns The reader.
 */
export function contextReader (context: AppContext): ContextReader {
  return {
    get: <T>(key: string, fallback?: T): T => {
      const value = key.split('.').reduce<unknown>(
        (current, segment) => (typeof current === 'object' && current !== null)
          ? (current as Record<string, unknown>)[segment]
          : undefined,
        { stone: context.stone }
      )

      return (value ?? fallback) as T
    }
  }
}
