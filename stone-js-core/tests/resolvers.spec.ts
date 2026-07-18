import { Kernel } from '../src/Kernel'
import { Config } from '@stone-js/config'
import { ConsoleLogger } from '../src/logger/ConsoleLogger'
import { OutgoingResponse } from '../src/events/OutgoingResponse'
import { defaultKernelResolver, defaultLoggerResolver, defaultResponseResolver } from '../src/resolvers'

/* eslint-disable @typescript-eslint/no-extraneous-class */

const mockBlueprint = Config.create()

describe('defaultLoggerResolver', () => {
  it('should create a ConsoleLogger with the given blueprint', () => {
    const logger = defaultLoggerResolver(mockBlueprint)
    expect(logger).toBeInstanceOf(ConsoleLogger)
  })
})

describe('defaultResponseResolver', () => {
  it('should create a OutgoingResponse with the given options', () => {
    const response = defaultResponseResolver({ content: 'Hello, World!' })
    expect(response).toBeInstanceOf(OutgoingResponse)
    expect(response.content).toBe('Hello, World!')
  })
})

describe('defaultKernelResolver', () => {
  it('should create a Kernel with the given blueprint and default dependencies', () => {
    mockBlueprint.set({ 'stone.kernel.eventHandler': () => {} })
    const kernel = defaultKernelResolver(mockBlueprint)
    expect(kernel).toBeInstanceOf(Kernel)
    expect(kernel.handle).toBeInstanceOf(Function)
    expect(kernel.onHandlingEvent).toBeInstanceOf(Function)
  })

  it('should create a Kernel with the given blueprint with class handler', () => {
    class Handler {}
    mockBlueprint.set({ 'stone.kernel.eventHandler': Handler })
    const kernel = defaultKernelResolver(mockBlueprint)
    expect(kernel).toBeInstanceOf(Kernel)
    expect(kernel.handle).toBeInstanceOf(Function)
    expect(kernel.onHandlingEvent).toBeInstanceOf(Function)
  })

  it('should create a Kernel with the given blueprint with function handler when class handler is undefined', () => {
    class Handler {}
    mockBlueprint.set({ 'stone.kernel.eventHandler': Handler })
    const kernel = defaultKernelResolver(mockBlueprint)
    expect(kernel).toBeInstanceOf(Kernel)
    expect(kernel.handle).toBeInstanceOf(Function)
    expect(kernel.onHandlingEvent).toBeInstanceOf(Function)
  })
})
