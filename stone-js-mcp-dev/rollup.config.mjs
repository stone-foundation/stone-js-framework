import multi from '@rollup/plugin-multi-entry'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import nodeExternals from 'rollup-plugin-node-externals'
import { createRollupConfig } from '../rollup.config.base.mjs'

export default createRollupConfig({
  multi,
  commonjs,
  typescript,
  nodeResolve,
  nodeExternals,
  builds: [
    // Node build: the full module (CLI command, MCP server, introspection, fs). Excludes the
    // browser stubs; the public `dist/index.d.ts` barrel is emitted here.
    { input: ['src/**/*.ts', '!src/browser/**/*'], file: 'dist/index.js', barrel: { exclude: ['browser/'] } },
    // Browser build: inert stubs only (no-op @McpDev, empty blueprint). Nothing Node-only is
    // bundled, so importing @stone-js/mcp-dev into a SPA never drags the stdio server or fs in.
    { input: ['src/browser/**/*.ts'], file: 'dist/browser.js' }
  ]
})
