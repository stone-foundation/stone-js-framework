import { IBlueprint, IncomingEvent } from '@stone-js/core'
import { getBuilderDefinitions, resolveBuilderDefinition } from '../../src/builders/resolveBuilder'
import { defaultBuilderDefinitions, serverBuilderDefinition } from '../../src/builders/builders'


vi.mock('@stone-js/filesystem', () => ({
  basePath: (v: string) => `/project/${v}`,
  buildPath: (v: string) => `/project/.stone/${v}`,
  distPath: (v: string) => `/project/dist/${v}`
}))

const blueprintWith = (values: Record<string, unknown> = {}): IBlueprint => ({
  get: vi.fn((key: string, fallback?: unknown) => values[key] ?? fallback)
} as unknown as IBlueprint)

const eventWith = (values: Record<string, unknown> = {}): IncomingEvent => ({
  get: vi.fn((key: string, fallback?: unknown) => values[key] ?? fallback)
} as unknown as IncomingEvent)

describe('The target the CLI ships with', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('answers anything, and sits last so it is the default', () => {
    // A project that renders nothing is a service. Building a React or a native application is
    // the business of the package that renders it, and each registers its own target.
    expect(serverBuilderDefinition.match(blueprintWith(), eventWith())).toBe(true)
    expect(serverBuilderDefinition.priority).toBe(100)
  })

  it('names what `stone serve` launches and what `stone preview` starts', () => {
    expect(serverBuilderDefinition.devEntry?.(blueprintWith())).toBe('/project/.stone/server.mjs')
    expect(serverBuilderDefinition.previewEntry?.(blueprintWith())).toBe('/project/dist/server.mjs')
    expect(serverBuilderDefinition.previewEntry?.(blueprintWith({ 'stone.builder.output': 'api.mjs' })))
      .toBe('/project/dist/api.mjs')
  })

  it('wants its dev server supervised, since nothing else reloads a backend build', () => {
    expect(serverBuilderDefinition.devMode).toBe('supervised')
  })

  it('builds a builder for the run', () => {
    const context: any = { blueprint: blueprintWith(), commandOutput: {}, commandInput: {} }

    expect(serverBuilderDefinition.resolver(context)).toBeTruthy()
  })

  it('is registered under the same public key a module would use', () => {
    const context: any = { blueprint: blueprintWith({ 'stone.builder.builders': defaultBuilderDefinitions }) }

    expect(getBuilderDefinitions(context).map((d) => d.target)).toEqual(['server'])
  })
})

describe('Resolving a target', () => {
  beforeEach(() => { vi.clearAllMocks() })

  const contextWith = (values: Record<string, unknown> = {}): any => ({
    blueprint: blueprintWith({ 'stone.builder.builders': defaultBuilderDefinitions, ...values })
  })

  it('treats an empty target as nothing named at all', () => {
    // yargs can hand back an empty positional, and a configuration can carry an empty string.

    expect(resolveBuilderDefinition(contextWith({ 'stone.builder.target': '' }), eventWith({ target: '' })).target)
      .toBe('server')
  })

  it('says so when no target is registered at all', () => {
    expect(() => resolveBuilderDefinition({ blueprint: blueprintWith({ 'stone.builder.builders': {} }) } as any, eventWith()))
      .toThrow(/No build target is registered/)
  })

  it('says so when nothing matched', () => {
    const context: any = {
      blueprint: blueprintWith({
        'stone.builder.builders': { server: { ...serverBuilderDefinition, match: () => false } }
      })
    }

    expect(() => resolveBuilderDefinition(context, eventWith())).toThrow(/No build target matched/)
  })

  it('ignores a malformed registration rather than crashing on it', () => {
    const context: any = {
      blueprint: blueprintWith({
        'stone.builder.builders': { broken: {}, server: serverBuilderDefinition }
      })
    }

    expect(resolveBuilderDefinition(context, eventWith()).target).toBe('server')
  })
})
