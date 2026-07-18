import { describe, it, expect } from 'vitest'
import { buildAssetAliases } from '../../src/react/react-utils'

describe('buildAssetAliases', () => {
  it('maps aliases to absolute subfolders of the assets dir', () => {
    const aliases = buildAssetAliases({ dir: 'assets', aliases: { '@img': 'images', '@css': 'css' } })
    expect(aliases['@img'].replace(/\\/g, '/')).toMatch(/\/assets\/images$/)
    expect(aliases['@css'].replace(/\\/g, '/')).toMatch(/\/assets\/css$/)
  })

  it('maps an empty subfolder to the assets dir itself', () => {
    const aliases = buildAssetAliases({ dir: 'assets', aliases: { '@assets': '' } })
    expect(aliases['@assets'].replace(/\\/g, '/')).toMatch(/\/assets$/)
    expect(aliases['@assets'].replace(/\\/g, '/')).not.toMatch(/\/assets\/$/)
  })

  it('defaults the dir to "assets" when omitted', () => {
    const aliases = buildAssetAliases({ aliases: { '@img': 'images' } })
    expect(aliases['@img'].replace(/\\/g, '/')).toMatch(/\/assets\/images$/)
  })

  it('returns an empty map when no aliases are configured', () => {
    expect(buildAssetAliases(undefined)).toEqual({})
    expect(buildAssetAliases({ dir: 'assets' })).toEqual({})
  })
})
