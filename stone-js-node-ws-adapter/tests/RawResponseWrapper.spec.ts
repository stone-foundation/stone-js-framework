import { RawResponseWrapper } from '../src/RawResponseWrapper'

describe('RawResponseWrapper', () => {
  it('returns the options it was created with', () => {
    const options = { statusCode: 200, content: { ok: true } }
    expect(RawResponseWrapper.create(options as any).respond()).toEqual(options)
  })
})
