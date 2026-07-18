import { Router } from '../src/Router'
import { RouterEventHandler } from '../src/RouterEventHandler'

describe('RouterEventHandler', () => {
  const createRouter = (): any => ({
    dispatch: vi.fn(async (event) => ({ status: 200, content: 'ok', event }))
  }) as unknown as Router<any, any>

  it('should forward the event to the router dispatcher', async () => {
    const mockEvent = { id: 1 } as any
    const router = createRouter()

    // @ts-expect-error – protected constructor
    const handler = new RouterEventHandler({ router })

    const response = await handler.handle(mockEvent)

    expect(response).toEqual({ status: 200, content: 'ok', event: mockEvent })
    expect(router.dispatch).toHaveBeenCalledWith(mockEvent)
  })
})
