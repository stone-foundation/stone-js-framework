import { Plugin } from 'vite'
import { readFileSync } from 'node:fs'

/**
 * A Vite plugin that removes imports and related code from the source files.
*/
export function removeImportsVitePlugin (modulesToRemove: Array<string | RegExp>): Plugin {
  return {
    name: 'vite-plugin-remove-imports',
    enforce: 'pre',
    load (id) {
      // Skip Vite virtual modules like '\0vite/modulepreload-polyfill.js'
      // Skip node_modules files
      if (id.startsWith('\0') || id.includes('node_modules')) return

      // Skip non-JS/TS files
      if (!/\.(ts|tsx|js|mjs|jsx|mjsx)$/i.test(id)) return

      const code = readFileSync(id, 'utf-8')
      let modifiedCode = code

      modulesToRemove.forEach(module => {
        // Match import statements
        const moduleValue = module instanceof RegExp ? module.source : module
        const importRegex = new RegExp(`import\\s*(\\*\\s*as\\s+\\w+|{[^}]+}|\\w+)\\s+from\\s*['"]${String(moduleValue)}['"];?`, 'g')
        const matches = [...modifiedCode.matchAll(importRegex)]

        let importedIdentifiers: string[] = []

        if (matches.length > 0) {
          matches.forEach(match => {
            const importContent = match[1]

            if (importContent.includes('{')) {
              // Handle named imports { ClassA, functionB }
              importedIdentifiers = importContent
                .replace(/[{}]/g, '')
                .split(',')
                .map(i => i.trim().split(/\s{1,20}as\s{1,20}/)[0]) // Handle aliasing
            } else {
              // Handle default or namespace imports
              importedIdentifiers.push(importContent)
            }

            // Remove the entire import statement
            modifiedCode = modifiedCode.replace(importRegex, '')
            importedIdentifiers = [...new Set(importedIdentifiers)]
          })
        }

        if (importedIdentifiers.length === 0) return

        // Remove decorators related to the removed imports
        modifiedCode = modifiedCode.replace(/@(\w+)\s*\([^)]*\)\s*/g, (match, decorator) =>
          importedIdentifiers.includes(decorator) ? '' : match
        )

        importedIdentifiers.forEach(value => {
          // Replace new instantiations
          modifiedCode = modifiedCode.replace(new RegExp(`new\\s+${value}\\s*\\([^)]*\\)`, 'g'), '{}')

          // Remove factory methods and static calls
          modifiedCode = modifiedCode.replace(new RegExp(`${value}\\.\\w+\\s*\\([^)]*\\)`, 'g'), '{}')

          // Remove function calls
          modifiedCode = modifiedCode.replace(new RegExp(`\\b${value}\\s*\\([^)]*\\)`, 'g'), '{}')

          // Remove namespace property access (e.g., `Http.SomeFunction()`)
          modifiedCode = modifiedCode.replace(new RegExp(`\\b${value}\\.\\w+`, 'g'), '{}')

          // Remove variable test like `if (value === IncomingHttpEvent)`
          modifiedCode = modifiedCode.replace(new RegExp(`!==?\\s*\\b${value}\\b`, 'g'), '!== undefined')
          modifiedCode = modifiedCode.replace(new RegExp(`===?\\s*\\b${value}\\b`, 'g'), '=== undefined')

          // Remove variable assignments like `const event = IncomingHttpEvent.create()`
          modifiedCode = modifiedCode.replace(new RegExp(`\\b${value}\\b`, 'g'), '{}')
        })

        // Remove dynamic imports `import('module').then()`
        modifiedCode = modifiedCode.replace(new RegExp(`import\\(['"]${String(moduleValue)}['"]\\)\\.then\\([^)]*\\)`, 'g'), '{}')

        // Ensure no broken syntax (empty statements)
        modifiedCode = modifiedCode.replace(/^\s{0,20};\s{0,20}$/gm, '')
      })

      if (modifiedCode === code) return

      this.addWatchFile(id)

      return {
        code: modifiedCode,
        map: null
      }
    }
  }
}
