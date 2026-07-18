import ts from 'typescript'
import fsExtra from 'fs-extra'
import { join } from 'node:path'

const { readdirSync, statSync, readFileSync, writeFileSync, removeSync, existsSync } = fsExtra

/**
 * Transpiles a TypeScript source string to readable vanilla JavaScript.
 *
 * Types are stripped while TC39 stage-3 decorators are preserved natively (target ESNext,
 * no `experimentalDecorators`), so the derived JS stays clean and idiomatic — the exact same
 * declarative or imperative code, just without type annotations. This is how Stone.js offers a
 * true JavaScript path without maintaining a second set of templates.
 *
 * @param code - The TypeScript source.
 * @returns The vanilla JavaScript source.
 */
export function toVanillaSource (code: string): string {
  return ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      isolatedModules: true,
      verbatimModuleSyntax: false
    }
  }).outputText
}

/**
 * Recursively collects the `.ts` files under a directory (skips `.d.ts`).
 *
 * @param dir - The directory to walk.
 * @returns The absolute `.ts` file paths.
 */
export function collectTsFiles (dir: string): string[] {
  if (!existsSync(dir)) { return [] }

  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...collectTsFiles(full))
    } else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) {
      files.push(full)
    }
  }
  return files
}

/**
 * Derives a vanilla-JavaScript version of a directory's TypeScript sources in place:
 * every `.ts` becomes a sibling `.js` and the original `.ts` is removed.
 *
 * @param dir - The directory (e.g. the project's `app/`).
 * @returns The paths of the generated `.js` files.
 */
export function deriveVanilla (dir: string): string[] {
  const generated: string[] = []
  for (const file of collectTsFiles(dir)) {
    const js = toVanillaSource(readFileSync(file, 'utf-8'))
    const target = file.replace(/\.ts$/, '.js')
    writeFileSync(target, js)
    removeSync(file)
    generated.push(target)
  }
  return generated
}
