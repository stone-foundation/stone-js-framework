import { OutgoingBrowserResponse, OutgoingBrowserResponseOptions } from '../src/OutgoingBrowserResponse'

// Mock options for OutgoingBrowserResponse
const mockOptions: OutgoingBrowserResponseOptions = {}

// Create an instance of OutgoingBrowserResponse for testing

describe('OutgoingBrowserResponse', () => {
  let response: OutgoingBrowserResponse

  beforeEach(() => {
    response = OutgoingBrowserResponse.create(mockOptions)
  })

  it('should create an instance of OutgoingBrowserResponse', () => {
    expect(response).toBeInstanceOf(OutgoingBrowserResponse)
  })

  it('should invoke isser\'s methods', () => {
    expect(response.isInvalid()).toBe(false)
    expect(response.is1xx()).toBe(false)
    expect(response.is2xx()).toBe(true)
    expect(response.isOk()).toBe(true)
    expect(response.is3xx()).toBe(false)
    expect(response.is4xx()).toBe(false)
    expect(response.isError()).toBe(false)
    expect(response.isNotError()).toBe(true)
    expect(response.isUnauthorized()).toBe(false)
    expect(response.isForbidden()).toBe(false)
    expect(response.isNotFound()).toBe(false)
    expect(response.is5xx()).toBe(false)
    // @ts-expect-error - Invalid status code for testing purposes
    response._statusCode = undefined
    expect(response.is5xx()).toBe(true)
    expect(response.isInvalid()).toBe(false)
    expect(response.isForbidden()).toBe(false)
    // @ts-expect-error - Invalid status code for testing purposes
    response._statusCode = 700
    expect(response.isInvalid()).toBe(true)
  })
})
