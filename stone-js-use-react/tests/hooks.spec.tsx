import React from 'react'
import { act, renderHook } from '@testing-library/react'
import { StoneContext, StoneContextType } from '@stone-js/use-react-core'
import { useHead, useRuntime } from '../src/hooks'

const makeContext = (): { context: StoneContextType, services: Record<string, any> } => {
  const services: Record<string, any> = {
    blueprint: { get: vi.fn() },
    config: { get: vi.fn() },
    router: { navigate: vi.fn(), getCurrentRoute: vi.fn(() => ({ path: '/now' })), on: vi.fn(), off: vi.fn() },
    reactRuntime: { head: vi.fn() },
    eventEmitter: { emit: vi.fn(), on: vi.fn() }
  }
  const container: any = {
    make: vi.fn((key: string) => services[key])
  }
  const context: StoneContextType = {
    container,
    event: { fingerprint: () => 'fp', source: { rawEvent: { native: true } } } as any,
    data: { user: 'John' }
  }
  return { context, services }
}

const wrapperFor = (context: StoneContextType) => ({ children }: { children: React.ReactNode }) =>
  <StoneContext.Provider value={context}>{children}</StoneContext.Provider>

describe('Web-only React hooks', () => {
  it('useRuntime resolves the runtime this package registers', () => {
    const { context, services } = makeContext()
    const w = wrapperFor(context)

    expect(renderHook(() => useRuntime(), { wrapper: w }).result.current).toBe(services.reactRuntime)
  })

  it('useHead applies the head via the runtime on the client', () => {
    const { context, services } = makeContext()
    const head = { title: 'Hello' }
    renderHook(() => useHead(head), { wrapper: wrapperFor(context) })
    expect(services.reactRuntime.head).toHaveBeenCalledWith(head)
  })
})
