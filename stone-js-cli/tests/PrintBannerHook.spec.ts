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

  it('falls back to the CLI version when the blueprint carries none', () => {
    const shown: string[] = []
    // A transparent chalk stand-in: every style is chainable and every call carries the text
    // through untouched (`format.hex(c).bold(x)`, `format.gray(x)`), so the assertion reads the
    // real banner text instead of a stubbed-out empty string.
    const tint = (value = ''): any => new Proxy(function () {}, {
      apply: (_t, _this, args: string[]) => tint(args[0] ?? value),
      get: (_t, prop) => (prop === Symbol.toPrimitive || prop === 'toString' || prop === 'valueOf')
        ? (() => value)
        : tint(value)
    })
    const plain: any = tint()
    const commandOutput: any = {
      show: (s: string = '') => shown.push(String(s)),
      breakLine: vi.fn(),
      format: plain
    }
    const blueprint: any = { get: vi.fn(() => '') }

    PrintBannerHook({ commandOutput, blueprint })

    // `stone init` runs before any project exists, so the framework's own version is what the
    // banner must show: an empty slot told the user nothing.
    expect(shown.join('\n')).toMatch(/Stone\.js\s+v\d+\.\d+\.\d+/)
  })

  it('does not throw when no version is configured', () => {
    const commandOutput: any = { show: vi.fn(), breakLine: vi.fn(), format: chain }
    const blueprint: any = { get: vi.fn(() => '') }
    expect(() => PrintBannerHook({ commandOutput, blueprint })).not.toThrow()
  })
})
