import { renderStoneBanner } from '../src/banner'

describe('renderStoneBanner', () => {
  it('renders the wordmark, rule and default tagline', () => {
    const banner = renderStoneBanner()
    expect(banner).toContain('Stone.js')
    expect(banner).toContain('The continuum framework')
    expect(banner).toContain('─')
  })

  it('honours a custom subtitle', () => {
    expect(renderStoneBanner('Powered by Stone.js')).toContain('Powered by Stone.js')
  })
})
