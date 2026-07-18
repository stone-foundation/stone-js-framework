import { StoneContext } from '../src/StoneContext'

describe('StoneContext', () => {
  it('should be a valid React context object', () => {
    expect(StoneContext).toHaveProperty('Provider')
    expect(StoneContext).toHaveProperty('Consumer')
  })

  it('should have default value as object (even if casted)', () => {
    // @ts-expect-error - testing internal structure
    expect(typeof StoneContext._currentValue).toBe('object')
  })
})
