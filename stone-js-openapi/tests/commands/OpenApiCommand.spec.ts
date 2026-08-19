import { writeFileSync } from 'node:fs'
import { OpenApiCommand, openApiCommandOptions } from '../../src/commands/OpenApiCommand'

vi.mock('node:fs', () => ({ writeFileSync: vi.fn() }))

const NameSchema = { validate: () => ({ success: true as const, value: {} }) }

/** A schema whose rules need a service: the case a booted container is needed for. */
class NeedsI18n {
  private readonly label: string
  constructor ({ i18n }: any) { this.label = i18n.t('validation.name') }
  rules (): any { return { body: { validate: () => ({ success: true as const, value: this.label }) } } }
}

const routeOf = (path: string, method: string, options: Record<string, unknown> = {}): any => ({
  path,
  method,
  getOption: (key: string, fallback?: unknown) => options[key] ?? fallback
})

const containerOf = (openapi: Record<string, unknown>, routes: any[] | undefined, schemas: Record<string, unknown> = {}): any => ({
  has: (key: string) => key === 'router' && routes !== undefined,
  make: (key: string) => key === 'blueprint'
    ? {
        get: (k: string, fallback?: unknown) => {
          if (k === 'stone.openapi') return openapi
          if (k === 'stone.validation.schemas') return schemas
          return fallback
        }
      }
    : { getRoutes: () => ({ getRoutes: () => routes }) },
  resolve: (Class: any) => new Class({ i18n: { t: () => 'translated' } })
})

describe('OpenApiCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('is declared for the console, with a show and an export action', () => {
    expect(openApiCommandOptions.name).toBe('openapi')
    expect(openApiCommandOptions.args).toEqual(['[action]'])
  })

  it('builds the contract from the booted application, services included', () => {
    // The reason the command exists: the container is up, so a schema class whose rules need i18n
    // contributes its real schema instead of being skipped.
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const container = containerOf(
      { info: { title: 'Tasks', version: '1.0.0' } },
      [routeOf('/users', 'POST', { validation: 'createUser' })],
      { createUser: NeedsI18n }
    )

    new OpenApiCommand(container).handle({ getMetadataValue: (_k: string, f: unknown) => f } as any)

    const document = JSON.parse(log.mock.calls[0][0] as string)
    expect(document.paths['/users'].post.requestBody).toBeDefined()
    log.mockRestore()
  })

  it('writes the document where asked, to commit it or feed a type generator', () => {
    const container = containerOf({}, [routeOf('/users', 'GET', { validation: NameSchema })])

    new OpenApiCommand(container).handle({
      getMetadataValue: (key: string, f: unknown) => (key === 'action' ? 'export' : key === 'output' ? 'api.json' : f)
    } as any)

    expect(writeFileSync).toHaveBeenCalledWith('api.json', expect.stringContaining('"openapi"'))
  })

  it('defaults the output path when exporting without one', () => {
    const container = containerOf({}, [routeOf('/x', 'GET')])

    new OpenApiCommand(container).handle({
      getMetadataValue: (key: string, f: unknown) => (key === 'action' ? 'export' : f)
    } as any)

    expect(writeFileSync).toHaveBeenCalledWith('openapi.json', expect.any(String))
  })

  it('serves a hand-written document untouched when one is configured', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const document = { openapi: '3.1.0', info: { title: 'By hand', version: '9' }, paths: {} }

    new OpenApiCommand(containerOf({ document }, undefined)).handle({ getMetadataValue: (_k: string, f: unknown) => f } as any)

    expect(JSON.parse(log.mock.calls[0][0] as string)).toEqual(document)
    log.mockRestore()
  })

  it('refuses to export a contract with no router, and says what to do', () => {
    const command = new OpenApiCommand(containerOf({}, undefined))

    expect(() => command.handle({ getMetadataValue: (_k: string, f: unknown) => f } as any))
      .toThrow(/without a router.*@Routing\(\)/s)
  })

  it('advertises the configured servers', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const container = containerOf(
      { servers: [{ url: 'https://api.example.com', description: 'prod' }] },
      [routeOf('/x', 'GET')]
    )

    new OpenApiCommand(container).handle({ getMetadataValue: (_k: string, f: unknown) => f } as any)

    expect(JSON.parse(log.mock.calls[0][0] as string).servers)
      .toEqual([{ url: 'https://api.example.com', description: 'prod' }])
    log.mockRestore()
  })
})
