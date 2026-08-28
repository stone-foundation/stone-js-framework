import { resolveListenUrl } from '../src/NodeHttpAdapter'

const DEFAULT = 'http://localhost:8080'

describe('where the server listens', () => {
  it('honours the port the platform assigned', () => {
    // The failure this pins, measured on a built 0.8.18 application: nothing in the framework read
    // `PORT`, so the default 8080 was used verbatim. Cloud Run, Heroku, Render, Fly, App Runner and
    // Railway all assign a port through the environment and route traffic to it, so the application
    // answered no request at all while looking healthy in development.
    const url = resolveListenUrl(DEFAULT, { PORT: '3000' })

    expect(url.port).toBe('3000')
  })

  it('binds every interface once the platform assigned the port', () => {
    // The other half, and the more expensive one: the server bound `localhost`, which nothing outside
    // a container can reach whatever port is forwarded. A platform that assigns the port is going to
    // reach the process from outside.
    expect(resolveListenUrl(DEFAULT, { PORT: '3000' }).hostname).toBe('0.0.0.0')
  })

  it('keeps loopback when no platform assigned anything', () => {
    // Locally, `stone dev` should not put a development server on the network without being asked.
    const url = resolveListenUrl(DEFAULT, {})

    expect(url.hostname).toBe('localhost')
    expect(url.port).toBe('8080')
  })

  it('lets HOST name the interface, port or no port', () => {
    expect(resolveListenUrl(DEFAULT, { HOST: '127.0.0.1' }).hostname).toBe('127.0.0.1')
    expect(resolveListenUrl(DEFAULT, { HOST: '127.0.0.1', PORT: '3000' }).hostname).toBe('127.0.0.1')
  })

  it('treats an empty variable as absent, which is what a shell hands over', () => {
    const url = resolveListenUrl(DEFAULT, { HOST: '', PORT: '' })

    expect(url.hostname).toBe('localhost')
    expect(url.port).toBe('8080')
  })

  it('leaves a declared URL alone, because the application said what it meant', () => {
    // The environment is the platform speaking, and the blueprint is the application speaking. When
    // both do, the application wins: an application that pinned a URL did it for a reason, and a
    // framework that overrode it would be unpredictable in the one place predictability is cheap.
    const declared = resolveListenUrl('http://127.0.0.1:9000', { HOST: '0.0.0.0', PORT: '3000' })

    expect(declared.hostname).toBe('127.0.0.1')
    expect(declared.port).toBe('9000')
  })
})
