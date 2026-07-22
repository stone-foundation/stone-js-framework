import { describe, it, expect, vi } from 'vitest'
import {
  STONE_MARK,
  stoneBanner,
  formatElapsed,
  renderSummary,
  StoneReporter
} from '../src/StoneReporter'

describe('stoneBanner', () => {
  it('renders the signature mark and subtitle', () => {
    const banner = stoneBanner('1.2.3')
    expect(banner).toContain(`${STONE_MARK} Stone.js`)
    expect(banner).toContain('v1.2.3')
    expect(banner).toContain('The continuum framework')
  })

  it('omits an empty or 0.0.0 version', () => {
    expect(stoneBanner('')).not.toContain('v')
    expect(stoneBanner('0.0.0')).not.toContain('v0.0.0')
  })

  it('accepts a custom subtitle', () => {
    expect(stoneBanner('1.0.0', 'Backend + frontend, one framework')).toContain('Backend + frontend, one framework')
  })

  it('keeps a version that already has a leading v', () => {
    const banner = stoneBanner('v2.0.0')
    expect(banner).toContain('v2.0.0')
    expect(banner).not.toContain('vv2.0.0')
  })

  it('draws the gem logo above the wordmark', () => {
    const banner = stoneBanner('1.0.0')
    expect(banner).toContain('◆ ◆ ◆ ◆ ◆')
    expect(banner.indexOf('◆ ◆ ◆ ◆ ◆')).toBeLessThan(banner.indexOf('◆ Stone.js'))
  })
})

describe('formatElapsed', () => {
  it('formats sub-second, seconds and minutes', () => {
    expect(formatElapsed(820)).toBe('820ms')
    expect(formatElapsed(1240)).toBe('1.24s')
    expect(formatElapsed(63000)).toBe('1m 03s')
  })
})

describe('renderSummary', () => {
  it('aligns labels and values', () => {
    const out = renderSummary([['Mode', 'SSR'], ['Output', 'dist/']])
    expect(out).toContain('Mode  ')
    expect(out).toContain('SSR')
    expect(out).toContain('dist/')
  })

  it('returns empty string for no rows', () => {
    expect(renderSummary([])).toBe('')
  })
})

/**
 * A fake CommandOutput capturing calls; `format` is an identity proxy so any chalk
 * method (`.cyanBright.bold(...)`, `.gray(...)`) returns its input unchanged.
 */
function fakeOutput (): any {
  const identity: any = new Proxy((v: string) => v, {
    get: () => identity,
    apply: (_t, _this, args) => args[0]
  })
  return {
    format: identity,
    show: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    succeed: vi.fn(),
    breakLine: vi.fn(),
    spin: vi.fn(() => ({ stop: vi.fn() }))
  }
}

describe('StoneReporter', () => {
  it('prints a banner (brand + rule + subtitle + blank line)', () => {
    const out = fakeOutput()
    StoneReporter.create(out, '1.0.0').banner()
    expect(out.show).toHaveBeenCalled()
    expect(out.breakLine).toHaveBeenCalledWith(1)
  })

  it('prints a branded step with the stone tag', () => {
    const out = fakeOutput()
    StoneReporter.create(out).step('Building…')
    expect(out.show).toHaveBeenCalledWith(expect.stringContaining('[stone]'))
    expect(out.show).toHaveBeenCalledWith(expect.stringContaining('Building…'))
  })

  it('prints success with elapsed time', () => {
    const out = fakeOutput()
    StoneReporter.create(out).success('Done', 1500)
    expect(out.succeed).toHaveBeenCalledWith(expect.stringContaining('Done'))
    expect(out.succeed).toHaveBeenCalledWith(expect.stringContaining('1.50s'))
  })

  it('prints success without elapsed time', () => {
    const out = fakeOutput()
    StoneReporter.create(out).success('Done')
    expect(out.succeed).toHaveBeenCalledWith('Done')
  })

  it('delegates info/warn/error', () => {
    const out = fakeOutput()
    const reporter = StoneReporter.create(out)
    reporter.info('i').warn('w').error('e')
    expect(out.info).toHaveBeenCalledWith('i')
    expect(out.warn).toHaveBeenCalledWith('w')
    expect(out.error).toHaveBeenCalledWith('e')
  })

  it('prints an aligned summary', () => {
    const out = fakeOutput()
    StoneReporter.create(out).summary([['Mode', 'SSR']])
    expect(out.show).toHaveBeenCalledWith(expect.stringContaining('SSR'))
    expect(out.breakLine).toHaveBeenCalledWith(1)
  })

  it('spins via the underlying output', () => {
    const out = fakeOutput()
    StoneReporter.create(out).spin('working')
    expect(out.spin).toHaveBeenCalledWith('working')
  })

  it('prints a dim hint line', () => {
    const out = fakeOutput()
    StoneReporter.create(out).hint('press Ctrl+C to stop')
    expect(out.show).toHaveBeenCalledWith(expect.stringContaining('press Ctrl+C to stop'))
  })

  it('prints a context-aware "changed" line with and without a repeat count', () => {
    const out = fakeOutput()
    const reporter = StoneReporter.create(out)

    reporter.changed('app/User.ts')
    expect(out.show).toHaveBeenLastCalledWith(expect.stringContaining('app/User.ts'))

    reporter.changed('app/User.ts', 3)
    expect(out.show).toHaveBeenLastCalledWith(expect.stringContaining('(x3)'))
  })
})
