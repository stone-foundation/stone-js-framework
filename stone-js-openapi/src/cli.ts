import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { StoneCliPlugin, StonePluginContext } from '@stone-js/cli'

/**
 * Where the plugin writes its generated types, relative to the build's `.stone/tmp` directory.
 *
 * The file carries only type declarations, so it is safe to import from both the browser entry and
 * the server entry without pulling in any runtime code.
 */
export const GENERATED_MODULE = 'plugins/openapi-types.ts'

/**
 * Options for the OpenAPI CLI plugin.
 */
export interface OpenapiCliPluginOptions {
  /**
   * A path or URL to an OpenAPI 3.x or Swagger 2.x document.
   *
   * - A URL starting with `https://` is fetched at build time.
   * - An absolute or relative path is read from disk.
   *
   * When omitted the plugin looks for a file at `.stone/tmp/openapi.json`.
   * That is the convention for a build script that already produces the
   * contract before the type-generation step.
   */
  source?: string
}

/**
 * Generate TypeScript type definitions from an OpenAPI schema object.
 *
 * This is build-time code only. It pulls in `openapi-typescript` dynamically so
 * the runtime bundle never carries it.
 *
 * @param schema - The parsed OpenAPI document.
 * @returns The TypeScript source.
 */
async function generateTypes (schema: unknown): Promise<string> {
  const { default: openapiTS, astToString } = await import('openapi-typescript')
  const ast = await openapiTS(schema as Parameters<typeof openapiTS>[0])
  return astToString(ast)
}

/**
 * Read and parse a JSON file from disk.
 *
 * @param filePath - The absolute path.
 * @returns The parsed object.
 */
function readJsonFile (filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

/**
 * Fetch and parse a JSON document from a URL.
 *
 * @param url - The URL.
 * @returns The parsed object.
 */
async function fetchJson (url: string): Promise<unknown> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`@stone-js/openapi: fetch ${url} returned ${res.status} ${res.statusText}`)
  }
  return await res.json()
}

/**
 * The OpenAPI Stone CLI plugin: typed frontend from the API contract.
 *
 * At build time (and in dev) it reads an OpenAPI or Swagger document from a
 * path or URL, generates TypeScript type definitions with `openapi-typescript`,
 * and writes them into `.stone/tmp/`. The types describe every request body,
 * response, and parameter the API exposes, so the frontend never hand-writes a
 * shape its own backend already defined.
 *
 * The plugin covers two sources:
 *
 * 1. **The app's own contract** (the common case). Generate the OpenAPI JSON
 *    before this plugin runs (an earlier build step), write it to
 *    `.stone/tmp/openapi.json`, and omit the `source` option. The plugin
 *    reads the file at build time, nothing leaves the repository.
 * 2. **An external contract**. Pass a path or URL as `source`. The plugin
 *    reads the document and generates types for it.
 *
 * The package entry (`@stone-js/openapi`) stays free of Node-only code. Every
 * filesystem and network call lives inside this plugin or the `./cli` export,
 * so a frontend bundle never pulls build-time dependencies in.
 *
 * @param options - The plugin options.
 * @returns The Stone CLI plugin.
 */
export function openapiCliPlugin (options: OpenapiCliPluginOptions = {}): StoneCliPlugin {
  const { source } = options

  return {
    name: '@stone-js/openapi',
    description: source !== undefined
      ? `Generates TypeScript types from ${source} at build time.`
      : 'Generates TypeScript types from the app\'s own OpenAPI contract at build time.',
    async onPrepare (context: StonePluginContext): Promise<void> {
      let schema: unknown

      if (source !== undefined) {
        schema = /^https?:\/\//.test(source)
          ? await fetchJson(source)
          : readJsonFile(path.isAbsolute(source) ? source : path.resolve(process.cwd(), source))
      } else {
        const specPath = context.buildPath('openapi.json')
        try {
          schema = readJsonFile(specPath)
        } catch {
          context.reporter.warn(
            '@stone-js/openapi: no OpenAPI document found at .stone/tmp/openapi.json. ' +
            'Set source in plugin options or generate the document before this plugin runs.'
          )
          return
        }
      }

      const types = await generateTypes(schema)
      context.writeFile(GENERATED_MODULE, types)
      context.addModule(`./${GENERATED_MODULE}`)
    }
  }
}

/**
 * A ready-to-use plugin instance, used by first-party `package.json` auto-discovery.
 */
const plugin: StoneCliPlugin = openapiCliPlugin()
export default plugin
