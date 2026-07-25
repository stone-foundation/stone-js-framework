/**
 * Pure string transforms that weave plugin contributions into a generated entry point.
 *
 * These are intentionally free of any I/O or CLI state so they can be unit-tested exhaustively:
 * the entry generators read the accumulated contributions and pass them through these functions.
 *
 * Two well-known markers anchor the injection in every entry template:
 * - `// %concat%` sits right after the `modules` array; contributed modules are `.concat(...)`-ed here.
 * - `// %blueprint%` sits inside the entry's `configure` step, with a local `blueprint` in scope.
 *
 * Each marker is preserved after injection so multiple, independent passes (e.g. lazy pages and
 * plugin modules both targeting `// %concat%`) compose without clobbering one another.
 */

/**
 * The marker anchoring contributed modules, right after the app's `modules` array.
 */
export const CONCAT_MARKER = '// %concat%'

/**
 * The marker anchoring contributed blueprint statements, inside the entry's `configure` step.
 */
export const BLUEPRINT_MARKER = '// %blueprint%'

/**
 * Inject contributed modules into an entry template.
 *
 * Prepends a namespace import per specifier and chains `.concat(Object.values(...))` onto the
 * `modules` array at {@link CONCAT_MARKER}, so the plugin's exports join the app's own modules.
 * A no-op when there are no modules or the template has no concat marker (e.g. a user-authored
 * entry), leaving the content untouched rather than emitting dangling imports.
 *
 * @param content - The entry template source.
 * @param modules - Import specifiers, resolvable from the entry's directory (`.stone/tmp`).
 * @returns The transformed source.
 */
export function injectPluginModules (content: string, modules: string[]): string {
  if (modules.length === 0 || !content.includes(CONCAT_MARKER)) {
    return content
  }

  const imports = modules
    .map((specifier, index) => `import * as __stonePlugin${index} from ${JSON.stringify(specifier)}`)
    .join('\n')

  const concat = modules
    .map((_specifier, index) => `.concat(Object.values(__stonePlugin${index}))`)
    .join('')

  return `${imports}\n${content}`.replace(CONCAT_MARKER, `${concat}\n  ${CONCAT_MARKER}`)
}

/**
 * Inject contributed blueprint statements into an entry template.
 *
 * Splices the statements into the entry's `configure` step at {@link BLUEPRINT_MARKER}, where a
 * local `blueprint` is in scope. A no-op when there are no statements or the template has no
 * blueprint marker.
 *
 * @param content - The entry template source.
 * @param statements - JavaScript statements executed with `blueprint` in scope.
 * @returns The transformed source.
 */
export function injectPluginBlueprints (content: string, statements: string[]): string {
  if (statements.length === 0 || !content.includes(BLUEPRINT_MARKER)) {
    return content
  }

  const block = statements.join('\n    ')

  return content.replace(BLUEPRINT_MARKER, `${block}\n    ${BLUEPRINT_MARKER}`)
}
