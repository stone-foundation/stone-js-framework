// @vitest-environment node
import { injectEnvScript } from '../../src/cli/ReactBuildMiddleware'

describe('the public environment script', () => {
  const template = '<html><head><!--env-js--></head><body><!--app-html--></body></html>'

  it('replaces the marker when there is a public environment', () => {
    expect(injectEnvScript(template, '/env/environments.js'))
      .toContain('<script src="/env/environments.js"></script>')
  })

  it('takes the marker out when there is none, rather than leaving it in the document', () => {
    // The defect this exists for: a server-rendered page served `<!--env-js-->` verbatim to every
    // visitor, so `window.process.env` was empty on a page rendered by the server while the built
    // `index.html` next to it carried the script. Nothing said so.
    const rendered = injectEnvScript(template)

    expect(rendered).not.toContain('<!--env-js-->')
    expect(rendered).not.toContain('<script')
  })

  it('leaves the rest of the document alone', () => {
    expect(injectEnvScript(template, '/env/environments.js')).toContain('<!--app-html-->')
  })
})
