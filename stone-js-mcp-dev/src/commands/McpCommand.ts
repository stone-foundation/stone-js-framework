import { initMcpJson } from '../mcpJson'
import { McpDevError } from '../errors/McpDevError'
import { startMcpDevServer } from '../McpDevServer'
import { createIntrospectionTools } from '../introspection'
import { IBlueprint, IContainer, IncomingEvent } from '@stone-js/core'
import { CommandOptions, IArgv, McpDevOptions } from '../declarations'

/**
 * Configuration for the `mcp` command.
 */
export const mcpCommandOptions: CommandOptions = {
  name: 'mcp',
  alias: 'm',
  desc: 'Start an MCP server (stdio) exposing Stone.js knowledge + your app + your tools to a coding agent',
  options: (yargs: IArgv) => {
    return yargs
      .option('init', { type: 'boolean', desc: 'Register this server in .mcp.json (create/merge) and exit' })
      .option('name', { type: 'string', desc: 'Override the MCP server name' })
      .option('quiet', { type: 'boolean', desc: 'Silence the stderr activity log' })
  }
}

/**
 * Starts the MCP dev server from the `stone mcp` command.
 *
 * It reads `stone.mcpDev` from the blueprint (server name, instructions, your tools) and lets the
 * MCP SDK own the protocol and tool execution: framework knowledge helpers do not need to traverse
 * the kernel. `--name` / `--quiet` flags override the configured values.
 */
export class McpCommand {
  /**
   * @param container - The dependency injection container.
   * @throws {McpDevError} If the container is not provided.
   */
  constructor (private readonly container: IContainer) {
    if (container === undefined) {
      throw new McpDevError('Container is required to create a McpCommand instance.')
    }
  }

  /**
   * Handle the `mcp` command: start the server and keep it running until interrupted.
   *
   * @param event - The incoming CLI event carrying the parsed flags.
   */
  async handle (event: IncomingEvent): Promise<void> {
    const blueprint = this.container.make<IBlueprint>('blueprint')

    if (event.getMetadataValue<boolean>('init', false)) {
      const { file, changed } = initMcpJson(process.cwd())
      process.stderr.write(changed ? `mcp: registered this server in ${file}\n` : `mcp: ${file} already registers this server\n`)
      return
    }

    const options = blueprint.get<McpDevOptions>('stone.mcpDev', {})
    const name = event.getMetadataValue<string | undefined>('name', options.name)
    const quiet = event.getMetadataValue<boolean>('quiet', options.quiet ?? false)
    const tools = [...createIntrospectionTools(blueprint), ...(options.tools ?? [])]

    await startMcpDevServer({ ...options, name, quiet, tools })
  }
}
