import { RouteDefinition, IIncomingEvent, StoneIncomingEvent } from '../../src/declarations'
import { defineEventHandler, defineRoute, defineRoutes } from '../../src/blueprint/KernelUtils'

class MyClassHandler {
  handle (_event: IIncomingEvent): string {
    return 'handled by class'
  }
}

const myFunctionHandler = (_event: IIncomingEvent): string => 'handled by function'

const myFactoryHandler = () => (_event: IIncomingEvent): string => 'handled by factory'

describe('defineEventHandler()', () => {
  it('should define a function handler', () => {
    const result = defineEventHandler(myFunctionHandler)
    expect(result).toEqual({ module: myFunctionHandler })
  })

  it('should define a factory handler', () => {
    const result = defineEventHandler(myFactoryHandler, { isFactory: true })
    expect(result).toEqual({
      module: myFactoryHandler,
      isFactory: true
    })
  })

  it('should define a class handler with action', () => {
    const result = defineEventHandler(MyClassHandler, { isClass: true, action: 'handle' })
    expect(result).toEqual({
      module: MyClassHandler,
      isClass: true,
      action: 'handle'
    })
  })
})

describe('defineRoute()', () => {
  it('should define route with function handler', () => {
    const result = defineRoute(myFunctionHandler, { path: '/func', method: 'GET' })

    expect(result).toEqual({
      stone: {
        router: {
          definitions: [
            {
              path: '/func',
              method: 'GET',
              methods: undefined,
              children: undefined,
              handler: {
                module: myFunctionHandler,
                isClass: undefined,
                isFactory: undefined,
                action: undefined
              }
            }
          ]
        }
      }
    })
  })

  it('should define route with factory handler', () => {
    const result = defineRoute(myFactoryHandler, {
      path: '/factory',
      method: 'POST',
      isFactory: true
    })

    expect(result.stone.router.definitions?.[0]).toMatchObject({
      path: '/factory',
      method: 'POST',
      handler: {
        module: myFactoryHandler,
        isFactory: true
      }
    })
  })

  it('should define route with class handler and action', () => {
    const result = defineRoute(MyClassHandler, {
      path: '/class',
      method: 'PUT',
      isClass: true,
      action: 'handle'
    })

    expect(result.stone.router.definitions?.[0]).toMatchObject({
      path: '/class',
      method: 'PUT',
      handler: {
        module: MyClassHandler,
        isClass: true,
        action: 'handle'
      }
    })
  })
})

describe('defineRoutes()', () => {
  it('should define multiple routes with tuple format', () => {
    const result = defineRoutes([
      [myFunctionHandler, { path: '/1', method: 'GET' }],
      [myFactoryHandler, { path: '/2', method: 'POST', isFactory: true }]
    ])

    expect(result.stone.router.definitions?.length).toBe(2)

    const [r1, r2] = result.stone.router.definitions as Array<RouteDefinition<StoneIncomingEvent>>

    expect(r1).toMatchObject({ path: '/1', method: 'GET', handler: { module: myFunctionHandler } })
    expect(r2).toMatchObject({ path: '/2', method: 'POST', handler: { module: myFactoryHandler, isFactory: true } })
  })

  it('should allow raw RouteDefinition as input', () => {
    const result = defineRoutes([
      { path: '/raw', method: 'GET', handler: { module: MyClassHandler, isClass: true, action: 'handle' } }
    ])

    expect(result.stone.router.definitions?.[0]).toMatchObject(
      { path: '/raw', method: 'GET', handler: { module: MyClassHandler, isClass: true, action: 'handle' } }
    )
  })
})
