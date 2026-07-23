import { PrintBannerHook } from '../src/PrintBannerHook'

/** A chainable no-op formatter: callable, gettable, and string-coercible (returns ''). */
const chain: any = new Proxy(function () { return chain }, {
  apply: () => chain,
  get: (_t, prop) => (prop === Symbol.toPrimitive || prop === 'toString' || prop === 'valueOf') ? (() => '') : chain
})

describe('PrintBannerHook', () => {
  it('resolves the version from the blueprint and emits the signature banner', () => {
    const shown: unknown[] = []
    const commandOutput: any = {
      show: (s: unknown = '') => shown.push(s),
      breakLine: vi.fn(),
      format: chain
    }
    const blueprint: any = { get: vi.fn(() => '1.2.3') }

    PrintBannerHook({ commandOutput, blueprint })

    expect(blueprint.get).toHaveBeenCalledWith('stone.builder.version', '')
    // The banner emits several lines (the portal logo + the wordmark rule + subtitle).
    expect(shown.length).toBeGreaterThan(3)
  })

  it('does not throw when no version is configured', () => {
    const commandOutput: any = { show: vi.fn(), breakLine: vi.fn(), format: chain }
    const blueprint: any = { get: vi.fn(() => '') }
    expect(() => PrintBannerHook({ commandOutput, blueprint })).not.toThrow()
  })
})
