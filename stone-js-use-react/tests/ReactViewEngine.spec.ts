import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { ReactViewEngine } from '../src/ReactViewEngine'
import { prerenderPage } from '../src/prerender'
import { createHead } from '../src/head'

async function collect (stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let out = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) { break }
    out += decoder.decode(value, { stream: true })
  }
  out += decoder.decode()
  return out
}

const TEMPLATE = '<!DOCTYPE html><html><head><title></title>\n<!--app-head--></head><body><div id="root"><!--app-html--></div></body></html>'

describe('ReactViewEngine — buffered SSR', () => {
  it('renders a node to an HTML string', async () => {
    const html = await ReactViewEngine.renderToString(createElement('div', { id: 'x' }, 'Hello'))
    expect(html).toContain('Hello')
    expect(html).toContain('id="x"')
  })

  it('createElement produces a valid React element', () => {
    const el = ReactViewEngine.createElement('span', { className: 'a' }, 'hi')
    expect(el).toBeTruthy()
    expect((el as any).type).toBe('span')
  })
})

describe('ReactViewEngine — streaming SSR (renderToStream)', () => {
  it('streams the app shell wrapped with head and tail', async () => {
    const node = createElement('main', null, createElement('h1', null, 'Streamed'))
    const stream = await ReactViewEngine.renderToStream!(node, {
      head: '<!DOCTYPE html><html><head></head><body><div id="root">',
      tail: '</div><script id="__STONE_SNAPSHOT__" type="application/json">{}</script></body></html>'
    })

    const html = await collect(stream)

    expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
    expect(html).toContain('<h1>Streamed</h1>')
    expect(html).toContain('id="__STONE_SNAPSHOT__"')
    expect(html.trimEnd().endsWith('</html>')).toBe(true)
  })

  it('invokes onShellReady', async () => {
    let ready = false
    const stream = await ReactViewEngine.renderToStream!(createElement('div', null, 'ok'), {
      onShellReady: () => { ready = true }
    })
    await collect(stream)
    expect(ready).toBe(true)
  })
})

describe('ReactViewEngine — client mount/hydrate', () => {
  it('mounts a node into a container', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = await ReactViewEngine.mount(createElement('p', null, 'Mounted'), container)
    // Let the concurrent root flush its initial render.
    await new Promise((r) => setTimeout(r, 30))
    expect(container.textContent).toContain('Mounted')
    root.unmount?.()
  })
})

describe('prerenderPage (SSG render step)', () => {
  it('assembles a full HTML document with head, app markup and snapshot', async () => {
    const head = createHead().title('Static').og({ type: 'website' }).toContext()
    const result = await prerenderPage({
      path: '/',
      node: createElement('section', null, 'Static content'),
      template: TEMPLATE,
      head,
      snapshot: { ssr: true, page: 'home' }
    })

    expect(result.path).toBe('/')
    expect(result.statusCode).toBe(200)
    expect(result.html).toContain('<title>Static</title>')
    expect(result.html).toContain('<meta property="og:type" content="website">')
    expect(result.html).toContain('Static content')
    expect(result.html).toContain('id="__STONE_SNAPSHOT__"')
    expect(result.html).toContain('"page":"home"')
  })

  it('defaults snapshot and status code', async () => {
    const result = await prerenderPage({ path: '/about', node: createElement('div', null, 'A'), template: TEMPLATE })
    expect(result.statusCode).toBe(200)
    expect(result.html).toContain('"ssr":true')
  })
})
