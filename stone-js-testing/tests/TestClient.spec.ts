import { TestClient } from '../src/TestClient'

/** A response carrying whatever `content` the kernel produced. */
const responseWith = (content: unknown): any => ({ statusCode: 200, content })

const clientReturning = (content: unknown): TestClient =>
  new TestClient(async () => responseWith(content))

describe('TestClient response readers', () => {
  it('parses a JSON body, which is what the wire carries', async () => {
    const response = await clientReturning('{"id":1}').send({} as any)

    expect(response.json()).toEqual({ id: 1 })
  })

  it('returns a body that is already a value, rather than pretending it was serialized', async () => {
    // `content` is not always a string, and `json()` answers "the body as data" either way.
    const response = await clientReturning({ id: 1 }).send({} as any)

    expect(response.json()).toEqual({ id: 1 })
    expect(response.text()).toBe('{"id":1}')
  })

  it('returns HTML as text, so a rendered page is asserted directly', async () => {
    const response = await clientReturning('<h1>Tasks</h1>').send({} as any)

    expect(response.html()).toBe('<h1>Tasks</h1>')
    expect(response.text()).toBe('<h1>Tasks</h1>')
  })

  it('adds the readers without changing the response in any other way', async () => {
    // The response a test receives is the response the handlers produced: same object, readers
    // hidden from enumeration so they stay out of snapshots and `toEqual`.
    const response = await clientReturning('{}').send({} as any)

    expect(Object.keys(response)).toEqual(['statusCode', 'content'])
    expect(JSON.parse(JSON.stringify(response))).toEqual({ statusCode: 200, content: '{}' })
  })
})

describe('TestClient on an app that produced nothing', () => {
  it('hands back what it got, so the assertion names the real problem', async () => {
    // Attaching readers to a non-object would throw inside the harness, and the test author would
    // read a `defineProperty` error instead of "your app returned nothing".
    const client = new TestClient(async () => undefined as any)

    await expect(client.send({} as any)).resolves.toBeUndefined()
  })
})
