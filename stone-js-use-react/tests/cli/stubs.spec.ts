// @vitest-environment node
import {
  reactClientEntryPointTemplate,
  reactServerEntryPointTemplate,
  reactConsoleEntryPointTemplate,
  reactHtmlEntryPointTemplate,
  viteDevServerTemplate
} from '../../src/cli/stubs'

import { NODE_CONSOLE_PLATFORM } from '@stone-js/node-cli-adapter'

describe('React stubs', () => {
  it('reactClientEntryPointTemplate should return valid client entry code with default path', () => {
    const code = reactClientEntryPointTemplate()
    expect(code).toContain("const rawModules = import.meta.glob('./app/**/*.{ts,js,mjs,json}'")
    expect(code).toContain('export const stone = stoneApp({ modules }).run()')
  })

  it('reactClientEntryPointTemplate should accept a custom path', () => {
    const custom = 'src/modules/**/*'
    const code = reactClientEntryPointTemplate(custom)
    expect(code).toContain(`import.meta.glob('${custom}'`)
  })

  it('reactServerEntryPointTemplate should return valid server entry code with default path and printUrls=true', () => {
    const code = reactServerEntryPointTemplate()
    expect(code).toContain("const rawModules = import.meta.glob('./app/**/*'")
    expect(code).toContain('blueprint.setIf(\'stone.adapter.printUrls\', true)')
  })

  it('reactServerEntryPointTemplate should accept custom path and printUrls=false', () => {
    const code = reactServerEntryPointTemplate('src/**/*.ts', false)
    expect(code).toContain("const rawModules = import.meta.glob('src/**/*.ts'")
    expect(code).toContain('blueprint.setIf(\'stone.adapter.printUrls\', false)')
  })

  it('reactConsoleEntryPointTemplate should return valid console entry with default path and platform', () => {
    const code = reactConsoleEntryPointTemplate()
    expect(code).toContain(`blueprint.set('stone.adapter.platform', '${NODE_CONSOLE_PLATFORM}')`)
    expect(code).toContain("const rawModules = import.meta.glob('./app/**/*'")
  })

  it('reactConsoleEntryPointTemplate should accept custom path and platform', () => {
    const code = reactConsoleEntryPointTemplate('src/**/*', 'my-platform')
    expect(code).toContain('import.meta.glob(\'src/**/*\'')
    expect(code).toContain('blueprint.set(\'stone.adapter.platform\', \'my-platform\')')
  })

  it('reactHtmlEntryPointTemplate should return full HTML with default script and css', () => {
    const html = reactHtmlEntryPointTemplate()
    expect(html).toContain('<!doctype html>')
    expect(html).toContain('<script type="module" src="/.stone/index.mjs"></script>')
    expect(html).toContain('<link rel="stylesheet" href="/assets/css/index.css" />')
    expect(html).toContain('<!--env-js-->')
    expect(html).toContain('<!--app-html-->')
  })

  it('reactHtmlEntryPointTemplate should accept custom script and css', () => {
    const html = reactHtmlEntryPointTemplate('<script>custom</script>', '<style>custom</style>')
    expect(html).toContain('<script>custom</script>')
    expect(html).toContain('<style>custom</style>')
  })

  it('imports the runner from the package that actually exports it', () => {
    // The template named `@stone-js/cli` after both runners had moved here, so every `stone dev` of
    // a React application died on `does not provide an export named 'runDevServer'` before a line of
    // the application ran. These two assertions were what said it was fine.
    const code = viteDevServerTemplate()

    expect(code).toContain('import { runDevServer } from \'@stone-js/use-react/cli\'')
    expect(code).toContain('const server = await runDevServer()')
  })

  it('accepts a custom runner name, from the same package', () => {
    const code = viteDevServerTemplate('runPreviewServer')

    expect(code).toContain('import { runPreviewServer } from \'@stone-js/use-react/cli\'')
    expect(code).toContain('const server = await runPreviewServer()')
  })

  it('names a runner this package really exports', async () => {
    // The assertion the two above could not make: the import specifier and the name are checked
    // against the module itself, so renaming or moving a runner fails here instead of at the first
    // `stone dev` somebody runs.
    //
    // The module that declares them, not the `./cli` barrel: importing the barrel drags every
    // build-time module it re-exports into this suite's coverage, and a test should not decide what
    // the gauge measures. The barrel re-exports this file wholesale, and the API report guards what
    // reaches the entry point.
    const cli = await import('../../src/cli/react-utils')

    for (const name of ['runDevServer', 'runPreviewServer']) {
      expect(viteDevServerTemplate(name)).toContain(`import { ${name} } from '@stone-js/use-react/cli'`)
      expect(typeof (cli as unknown as Record<string, unknown>)[name]).toBe('function')
    }
  })
})
