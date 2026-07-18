import { RawResponse } from '../src/declarations'
import { RawResponseWrapper } from '../src/RawResponseWrapper'

describe('RawResponseWrapper', () => {
  let mockResponse: RawResponse

  beforeEach(() => {
    // Mock the ServerResponse object
    mockResponse = {
      statusCode: 404,
      statusMessage: 'Not Found',
      body: 'Hello, world!',
      headers: { 'Content-Type': 'application/json' }
    }
  })

  it('should set status code and message when options are provided', () => {
    const wrapper = RawResponseWrapper.create(mockResponse)

    const rawResponse = wrapper.respond()

    expect(rawResponse).toEqual(mockResponse)
    expect(rawResponse.statusCode).toBe(404)
    expect(rawResponse.statusMessage).toBe('Not Found')
  })

  it('should handle missing options gracefully', () => {
    const wrapper = RawResponseWrapper.create({})

    const rawResponse = wrapper.respond()

    expect(rawResponse).not.toEqual(mockResponse)
    expect(rawResponse).toEqual({})
  })
})
