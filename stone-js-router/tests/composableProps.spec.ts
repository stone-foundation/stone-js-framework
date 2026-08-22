import { RouteMapper } from '../src/RouteMapper'
import { CallableDispatcher } from '../src/dispatchers/CallableDispatcher'

const mapper = (composableProps?: string[]): any => RouteMapper.create({
  maxDepth: 5,
  composableProps,
  matchers: [],
  dispatchers: { callable: CallableDispatcher }
} as any)

const gateOf = (m: any, parent: any): unknown => m.toRoutes([parent])[0].getOption('gate')

describe('module props a module declared composable', () => {
  it('composes parent-first when both sides declare the prop', () => {
    // A gate on a group must hold for every child on top of the child's own, in that order: the
    // group encloses its routes, exactly the reason group middleware runs first. Tested with a
    // generic name, because the router must never know which module's key this is.
    const gate = gateOf(mapper(['gate']), {
      path: '/admin',
      gate: 'parent',
      children: [{ path: '/name', method: 'GET', gate: 'child', handler: () => ({} as any) }]
    })

    expect(gate).toEqual(['parent', 'child'])
  })

  it('flattens a side that already declared a chain', () => {
    const gate = gateOf(mapper(['gate']), {
      path: '/admin',
      gate: ['a', 'b'],
      children: [{ path: '/name', method: 'GET', gate: 'c', handler: () => ({} as any) }]
    })

    expect(gate).toEqual(['a', 'b', 'c'])
  })

  it('lets a single side flow through untouched', () => {
    const m = mapper(['gate'])
    const fromParent = gateOf(m, {
      path: '/admin',
      gate: 'parent',
      children: [{ path: '/name', method: 'GET', handler: () => ({} as any) }]
    })
    const fromChild = gateOf(m, {
      path: '/admin',
      children: [{ path: '/name', method: 'GET', gate: 'child', handler: () => ({} as any) }]
    })

    expect(fromParent).toBe('parent')
    expect(fromChild).toBe('child')
  })

  it('keeps child-wins for everything not declared composable', () => {
    // The default merge is right for most props: a child's contract is its contract.
    const gate = gateOf(mapper(), {
      path: '/admin',
      gate: 'parent',
      children: [{ path: '/name', method: 'GET', gate: 'child', handler: () => ({} as any) }]
    })

    expect(gate).toBe('child')
  })

  it('composes through nested groups, outermost first', () => {
    // Three levels, because a real application nests: the platform gate, the module gate, the route.
    const gate = gateOf(mapper(['gate']), {
      path: '/admin',
      gate: 'platform',
      children: [{
        path: '/orgs',
        gate: 'org',
        children: [{ path: '/name', method: 'GET', gate: 'route', handler: () => ({} as any) }]
      }]
    })

    expect(gate).toEqual(['platform', 'org', 'route'])
  })
})
