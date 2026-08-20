import { UseReactError } from '../src/errors/UseReactError'
import { UseReactEventHandler } from '../src/UseReactEventHandler'

describe('UseReactEventHandler', () => {
  it('returns the component event handler from blueprint', () => {
    const componentHandler = { path: '/page', module: () => {} }

    const blueprint = {
      get: vi.fn().mockReturnValue(componentHandler)
    }

    const handler = new UseReactEventHandler({ blueprint } as any)
    const result = handler.handle()

    expect(blueprint.get).toHaveBeenCalledWith('stone.useReact.componentEventHandler')
    expect(result).toBe(componentHandler)
  })

  it('throws UseReactError if no handler is defined', () => {
    const blueprint = {
      get: vi.fn().mockReturnValue(undefined)
    }

    const handler = new UseReactEventHandler({ blueprint } as any)

    expect(() => handler.handle()).toThrow(UseReactError)
    expect(() => handler.handle()).toThrow('The component event handler is missing.')
  })
})
