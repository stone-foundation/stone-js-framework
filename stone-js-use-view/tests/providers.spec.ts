import { describe, it, expect } from 'vitest'
import { defineViewProvider, isViewProvider, composeProviders } from '../src/providers'

// A tiny fake engine: elements are plain objects.
const h = (component: unknown, props: Record<string, unknown> | null, ...children: unknown[]): any =>
  ({ component, props, children })

describe('defineViewProvider / isViewProvider', () => {
  it('normalizes a provider with default priority 10', () => {
    const Theme = () => null
    const p = defineViewProvider(Theme)
    expect(p.__viewProvider).toBe(true)
    expect(p.priority).toBe(10)
    expect(isViewProvider(p)).toBe(true)
    expect(isViewProvider({})).toBe(false)
  })
})

describe('composeProviders', () => {
  it('wraps children outermost-first by ascending priority', () => {
    const Outer = () => null
    const Inner = () => null
    const providers = [
      defineViewProvider(Inner, { priority: 20 }),
      defineViewProvider(Outer, { priority: 5 })
    ]

    const tree: any = composeProviders(providers, 'APP', h, (p) => p.module)

    // Outer (priority 5) is the outermost element; its child is Inner; Inner's child is APP.
    expect(tree.component).toBe(Outer)
    expect(tree.children[0].component).toBe(Inner)
    expect(tree.children[0].children[0]).toBe('APP')
  })

  it('passes provider props and base props', () => {
    const Theme = () => null
    const providers = [defineViewProvider(Theme, { props: { mode: 'dark' } })]
    const tree: any = composeProviders(providers, 'APP', h, (p) => p.module, { container: 'C' })
    expect(tree.props).toEqual({ container: 'C', mode: 'dark' })
  })

  it('returns children unchanged when there are no providers', () => {
    expect(composeProviders([], 'APP', h, (p) => p.module)).toBe('APP')
  })

  it('resolves providers through the resolver (DI-aware)', () => {
    const Resolved = () => null
    const providers = [defineViewProvider('token', {})]
    const tree: any = composeProviders(providers, 'APP', h, () => Resolved)
    expect(tree.component).toBe(Resolved)
  })
})
