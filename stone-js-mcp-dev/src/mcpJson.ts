import { join } from 'node:path'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

/**
 * Injectable filesystem surface, so `.mcp.json` handling stays testable.
 */
export interface McpJsonIo {
  exists: (path: string) => boolean
  read: (path: string) => string
  write: (path: string, content: string) => void
}

/* v8 ignore start -- thin filesystem defaults */
const defaultIo: McpJsonIo = {
  exists: (path) => existsSync(path),
  read: (path) => readFileSync(path, 'utf-8'),
  write: (path, content) => writeFileSync(path, content, 'utf-8')
}
/* v8 ignore stop */

/**
 * The `.mcp.json` server entry that launches this dev server.
 *
 * @param command - The launcher command (defaults to `stone`).
 * @returns The MCP server entry.
 */
export function mcpServerEntry (command: string = 'stone'): { command: string, args: string[] } {
  return { command, args: ['mcp'] }
}

/**
 * Merge the `stone` server into an existing `.mcp.json` object without clobbering anything.
 *
 * It only adds the `stone` entry when absent, so a developer's own config (other servers, or a
 * customized `stone` entry) is preserved.
 *
 * @param existing - The parsed `.mcp.json` (or undefined when the file does not exist).
 * @returns The merged config and whether it changed.
 */
export function mergeMcpJson (existing: Record<string, unknown> | undefined): { config: Record<string, unknown>, changed: boolean } {
  const config: Record<string, unknown> = { ...existing }
  const servers: Record<string, unknown> = { ...(config.mcpServers as Record<string, unknown> | undefined) }
  const changed = servers.stone === undefined
  if (changed) { servers.stone = mcpServerEntry() }
  config.mcpServers = servers
  return { config, changed }
}

/**
 * Create or update `.mcp.json` at `cwd` so a coding agent discovers this server. Idempotent: it
 * writes only when the `stone` entry is missing, and never overwrites the rest of the file.
 *
 * @param cwd - The project root.
 * @param io - The filesystem surface (defaults to `node:fs`).
 * @returns The file path and whether it was written.
 */
export function initMcpJson (cwd: string, io: McpJsonIo = defaultIo): { file: string, changed: boolean } {
  const file = join(cwd, '.mcp.json')
  let existing: Record<string, unknown> | undefined
  if (io.exists(file)) {
    try {
      existing = JSON.parse(io.read(file)) as Record<string, unknown>
    } catch {
      existing = undefined
    }
  }
  const { config, changed } = mergeMcpJson(existing)
  if (changed) { io.write(file, `${JSON.stringify(config, null, 2)}\n`) }
  return { file, changed }
}

/**
 * Whether a `.mcp.json` exists at `cwd`.
 *
 * @param cwd - The project root.
 * @param io - The filesystem surface (defaults to `node:fs`).
 * @returns True when the file exists.
 */
export function hasMcpJson (cwd: string, io: McpJsonIo = defaultIo): boolean {
  return io.exists(join(cwd, '.mcp.json'))
}
