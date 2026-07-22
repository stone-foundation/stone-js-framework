import { ConfigFileFormat } from './declarations'
import { ConfigSourceError } from './errors/ConfigSourceError'

/**
 * Resolve a module's default export across ESM/CJS interop.
 *
 * @param mod - The imported module namespace.
 * @returns The default export (or the namespace).
 */
export function resolveModuleDefault<T = any> (mod: any): T {
  return (mod?.default ?? mod) as T
}

/**
 * Parse a config document (JSON or YAML) into an object.
 *
 * @param raw - The raw document.
 * @param format - The format (`yaml` imports `js-yaml` lazily).
 * @returns The parsed object.
 * @throws {ConfigSourceError} When YAML is requested without `js-yaml`, or parsing fails.
 */
export async function parseConfig (raw: string, format: ConfigFileFormat): Promise<Record<string, unknown>> {
  try {
    if (format === 'yaml') {
      const yaml = await import('js-yaml').then(resolveModuleDefault).catch(() => {
        throw new ConfigSourceError('YAML config requires "js-yaml". Install it: npm i js-yaml')
      })
      return (yaml.load(raw) ?? {}) as Record<string, unknown>
    }
    return JSON.parse(raw)
  } catch (error: any) {
    if (error instanceof ConfigSourceError) { throw error }
    throw new ConfigSourceError(`Failed to parse ${format} config.`, { cause: error })
  }
}

/**
 * Infer a config format from a path/URL extension (defaults to `json`).
 *
 * @param pathOrUrl - The path or URL.
 * @returns The inferred format.
 */
export function formatOf (pathOrUrl: string): ConfigFileFormat {
  return /\.ya?ml($|\?)/i.test(pathOrUrl) ? 'yaml' : 'json'
}

/** Keys refused when nesting, to avoid prototype pollution from external providers. */
const UNSAFE = new Set(['__proto__', 'prototype', 'constructor'])

/**
 * Set a value at a nested path (segments), creating intermediate objects.
 *
 * @param target - The object to mutate.
 * @param segments - The path segments (e.g. `['db', 'url']`).
 * @param value - The value to set.
 * @returns The mutated target.
 */
export function setPath (target: Record<string, any>, segments: string[], value: unknown): Record<string, any> {
  if (segments.some((s) => UNSAFE.has(s))) { return target }
  let node = target
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i]
    node[seg] = (typeof node[seg] === 'object' && node[seg] !== null) ? node[seg] : {}
    node = node[seg]
  }
  node[segments[segments.length - 1]] = value
  return target
}

/**
 * Apply a per-leaf transform to every scalar value of a config object (recursively).
 *
 * @param value - The value (object, array or leaf).
 * @param transform - The transform to apply to leaves.
 * @param key - The current dotted key path.
 * @returns The transformed value.
 */
export async function transformLeaves (
  value: unknown,
  transform: (value: unknown, key: string) => unknown,
  key: string = ''
): Promise<unknown> {
  if (Array.isArray(value)) {
    return await Promise.all(value.map(async (item, i) => await transformLeaves(item, transform, `${key}[${i}]`)))
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      out[k] = await transformLeaves(v, transform, key === '' ? k : `${key}.${k}`)
    }
    return out
  }
  return transform(value, key)
}
