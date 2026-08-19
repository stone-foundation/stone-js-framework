import { ADAPTER_PLATFORMS, KNOWN_PLATFORMS, packageProviding, packagesToExclude } from '../../src/server/platforms'
import { assertPlatformIsBuildable, excludedFor, installedAdapters, stubSource } from '../../src/server/platformStubs'

const deps = ['@stone-js/node-cli-adapter', '@stone-js/node-http-adapter', '@stone-js/router', 'zod']

describe('the platform map', () => {
  it('covers every first-party adapter, with unique identifiers', () => {
    expect(Object.keys(ADAPTER_PLATFORMS).length).toBeGreaterThanOrEqual(16)
    expect(KNOWN_PLATFORMS).toContain('aws_lambda_http')
    expect(KNOWN_PLATFORMS).toContain('node_console')
    expect(packageProviding('node_http')).toBe('@stone-js/node-http-adapter')
    expect(packageProviding('nope')).toBeUndefined()
  })

  it('excludes every adapter but the selected one, and touches nothing else', () => {
    // The measured win: dropping the CLI adapter takes a lab artefact from 2.47 MB to 1.97 MB,
    // because it brings yargs, prompts, ora, chalk and progress with it.
    expect(packagesToExclude('node_http', installedAdapters(deps)))
      .toEqual(['@stone-js/node-cli-adapter'])
    expect(installedAdapters(deps)).not.toContain('zod')
    expect(installedAdapters(deps)).not.toContain('@stone-js/router')
  })

  it('excludes nothing when the project has a single adapter', () => {
    expect(excludedFor('node_http', ['@stone-js/node-http-adapter'])).toEqual([])
  })
})

describe('assertPlatformIsBuildable', () => {
  it('accepts a platform the project can actually build', () => {
    expect(() => assertPlatformIsBuildable('node_http', deps)).not.toThrow()
  })

  it('refuses an unknown platform, and lists the ones that exist', () => {
    expect(() => assertPlatformIsBuildable('lambda', deps)).toThrow(/Unknown platform 'lambda'/)
    expect(() => assertPlatformIsBuildable('lambda', deps)).toThrow(/aws_lambda_http/)
  })

  it('refuses a platform whose adapter is not installed, and says how to fix it', () => {
    // Building it anyway would deploy, start, and find no adapter to answer with: the worst possible
    // moment to learn the platform was never enabled.
    expect(() => assertPlatformIsBuildable('aws_lambda_http', deps))
      .toThrow(/does not depend on @stone-js\/aws-lambda-http-adapter/)
    expect(() => assertPlatformIsBuildable('aws_lambda_http', deps)).toThrow(/npm i @stone-js/)
  })
})

describe('stubSource', () => {
  it('declares every name the real module does, all inert', () => {
    const source = stubSource(['NodeConsole', 'nodeConsoleAdapterBlueprint'])

    expect(source).toContain('export const NodeConsole')
    expect(source).toContain('export const nodeConsoleAdapterBlueprint')
    expect(source).toContain('export default {}')
  })

  it('produces a value that survives being used as a decorator or read as a blueprint', () => {
    // Safe precisely because the platform was not selected: the entry is never chosen and the adapter
    // never instantiated, so nothing calls into it. It only has to satisfy the bindings.
    const declaration = stubSource(['X']).split('\n').find((line) => line.startsWith('export const X'))
    // eslint-disable-next-line no-new-func
    const value: any = new Function(`${declaration?.replace('export const', 'const') ?? ''}; return X`)()

    expect(typeof value).toBe('function')      // usable as a decorator factory
    expect(typeof value()).toBe('function')    // which returns a no-op decorator
    expect(value.stone).toEqual({})            // and reads as an empty blueprint
  })
})
