/**
 * The platform tag the CLI adapter runs under. Re-declared locally (rather than imported) to keep
 * this package decoupled from `@stone-js/node-cli-adapter`; the value must match the adapter's.
 */
export const NODE_CONSOLE_PLATFORM: string = 'node_console'

/** The default MCP server name when the app declares none. */
export const DEFAULT_MCP_SERVER_NAME: string = 'stone-mcp-dev'

/** The default MCP server version. */
export const DEFAULT_MCP_SERVER_VERSION: string = '0.0.0'

/**
 * The default `instructions` advertised to the agent: what this server is and how to use it.
 */
export const DEFAULT_MCP_INSTRUCTIONS: string = [
  'This MCP server exposes the Stone.js framework knowledge to help you build on it.',
  'Use the `stone_*` tools to look up concepts, modules, best-practices, gaps and documentation',
  'links before writing Stone.js code, so your answers match the framework\'s actual conventions.',
  'Any additional tools are provided by the developer for this project.'
].join(' ')
