import { RawResponseWrapper } from '../src/RawResponseWrapper'
import { RawBrowserResponseOptions } from '../src/declarations'

describe('RawResponseWrapper', () => {
  let mockResponse: RawBrowserResponseOptions

  beforeEach(() => {
    // Mock the ServerResponse object
    mockResponse = {
      render: vi.fn().mockReturnValue('Hello, world!')
    }
  })

  it('should set status code and message when options are provided', async () => {
    const wrapper = RawResponseWrapper.create(mockResponse)

    const rawResponse = await wrapper.respond()

    expect(rawResponse).toEqual('Hello, world!')
    expect(mockResponse.render).toHaveBeenCalled()
  })

  it('should handle missing options gracefully', async () => {
    // @ts-expect-error
    const wrapper = RawResponseWrapper.create({})

    const rawResponse = await wrapper.respond()

    expect(rawResponse).toBeUndefined()
  })
})
