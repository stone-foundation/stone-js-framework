import { RawResponse } from '../src/declarations'
import { RawResponseWrapper } from '../src/RawResponseWrapper'

describe('RawResponseWrapper', () => {
  let mockResponseOptions: { exitCode: RawResponse }

  beforeEach(() => {
    // Mock the ServerResponse object
    mockResponseOptions = { exitCode: 0 }
  })

  it('should set exit code when options are provided', () => {
    const wrapper = RawResponseWrapper.create(mockResponseOptions)

    const rawResponse = wrapper.respond()

    expect(rawResponse).toEqual(0)
  })

  it('should degrade a missing/unusable exit code to a general failure (1), never NaN', () => {
    const wrapper = RawResponseWrapper.create({})

    const rawResponse = wrapper.respond()

    expect(rawResponse).toBe(1)
    expect(rawResponse).not.toBeNaN()
    expect(rawResponse).not.toEqual(mockResponseOptions)
  })
})
