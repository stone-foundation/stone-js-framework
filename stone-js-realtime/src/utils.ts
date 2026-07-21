/**
 * Resolve a module's default export across ESM/CJS interop.
 *
 * @param mod - The imported module namespace.
 * @returns The default export.
 */
export function resolveModuleDefault<T = any> (mod: any): T {
  return (mod?.default ?? mod) as T
}
