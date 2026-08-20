import { glob } from 'glob'
import { IBlueprint, IncomingEvent } from '@stone-js/core'
import { getBuilderDefinitions, resolveBuilderDefinition } from '../../src/builders/resolveBuilder'
import { defaultBuilderDefinitions, hasReactViews, reactBuilderDefinition, serverBuilderDefinition } from '../../src/builders/builders'

vi.mock('glob', () => ({ glob: { sync: vi.fn() } }))

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

describe('The targets the CLI ships with', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('detects a React project by its views', () => {
    vi.mocked(glob.sync).mockReturnValue(['/project/app/HomePage.tsx'] as any)

    expect(hasReactViews(blueprintWith())).toBe(true)
    expect(reactBuilderDefinition.match(blueprintWith(), eventWith())).toBe(true)
  })

  it('does not claim a project with no views', () => {
    vi.mocked(glob.sync).mockReturnValue([] as any)

    expect(reactBuilderDefinition.match(blueprintWith(), eventWith())).toBe(false)
  })

  it('looks where the project says its views are', () => {
    vi.mocked(glob.sync).mockReturnValue([] as any)

    hasReactViews(blueprintWith({ 'stone.builder.input.views': 'src/**/*.tsx' }))

    expect(glob.sync).toHaveBeenCalledWith('/project/src/**/*.tsx')
  })

  it('lets the backend target answer anything, and puts it last', () => {
    expect(serverBuilderDefinition.match(blueprintWith(), eventWith())).toBe(true)
    expect(serverBuilderDefinition.priority).toBeGreaterThan(reactBuilderDefinition.priority as number)
  })

  it('names where each target is previewed from', () => {
    expect(reactBuilderDefinition.previewEntry?.(blueprintWith())).toBe('/project/.stone/preview.mjs')
    expect(serverBuilderDefinition.previewEntry?.(blueprintWith())).toBe('/project/dist/server.mjs')
    expect(serverBuilderDefinition.previewEntry?.(blueprintWith({ 'stone.builder.output': 'api.mjs' })))
      .toBe('/project/dist/api.mjs')
  })

  it('declares how each one wants its dev server supervised', () => {
    expect(reactBuilderDefinition.devMode).toBe('self-hosted')
    expect(serverBuilderDefinition.devMode).toBe('supervised')
  })

  it('builds a builder for the run', () => {
    const context: any = { blueprint: blueprintWith(), commandOutput: {}, commandInput: {} }

    expect(reactBuilderDefinition.resolver(context)).toBeTruthy()
    expect(serverBuilderDefinition.resolver(context)).toBeTruthy()
  })

  it('registers both under the same public key a module would use', () => {
    const context: any = { blueprint: blueprintWith({ 'stone.builder.builders': defaultBuilderDefinitions }) }

    expect(getBuilderDefinitions(context).map((d) => d.target)).toEqual(['react', 'server'])
  })
})

describe('Resolving a target', () => {
  beforeEach(() => { vi.clearAllMocks() })

  const contextWith = (values: Record<string, unknown> = {}): any => ({
    blueprint: blueprintWith({ 'stone.builder.builders': defaultBuilderDefinitions, ...values })
  })

  it('treats an empty target as nothing named at all', () => {
    // yargs can hand back an empty positional, and a configuration can carry an empty string.
    vi.mocked(glob.sync).mockReturnValue([] as any)

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
        'stone.builder.builders': { react: { ...reactBuilderDefinition, match: () => false } }
      })
    }

    expect(() => resolveBuilderDefinition(context, eventWith())).toThrow(/No build target matched/)
  })

  it('ignores a malformed registration rather than crashing on it', () => {
    vi.mocked(glob.sync).mockReturnValue([] as any)
    const context: any = {
      blueprint: blueprintWith({
        'stone.builder.builders': { broken: {}, server: serverBuilderDefinition }
      })
    }

    expect(resolveBuilderDefinition(context, eventWith()).target).toBe('server')
  })
})
