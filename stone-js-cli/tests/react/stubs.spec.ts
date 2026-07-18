import {
  reactClientEntryPointTemplate,
  reactServerEntryPointTemplate,
  reactConsoleEntryPointTemplate,
  reactHtmlEntryPointTemplate,
  viteDevServerTemplate
} from '../../src/react/stubs'

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

  it('viteDevServerTemplate should return server entry with default serverName', () => {
    const code = viteDevServerTemplate()
    expect(code).toContain('import { runDevServer } from \'@stone-js/cli\'')
    expect(code).toContain('const server = await runDevServer()')
  })

  it('viteDevServerTemplate should accept a custom serverName', () => {
    const code = viteDevServerTemplate('start')
    expect(code).toContain('import { start } from \'@stone-js/cli\'')
    expect(code).toContain('const server = await start()')
  })
})
