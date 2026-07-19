import { defineAbility } from '../src/casl'
import { authorize } from '../src/middleware/authorize'
import { AbilityMiddleware } from '../src/middleware/AbilityMiddleware'
import { AuthorizationError } from '../src/errors/AuthorizationError'

const eventStub = (over: any = {}): any => {
  const meta: Record<string, unknown> = { ...over.meta }
  return {
    getUser: () => over.user,
    setMetadataValue: (k: string, v: unknown) => { meta[k] = v },
    getMetadataValue: <T>(k: string, fb?: T) => (k in meta ? meta[k] : fb) as T
  }
}

describe('AbilityMiddleware', () => {
  it('builds and attaches the ability for the current user', async () => {
    const ability = defineAbility((can) => can('read', 'Post'))
    const authorizer: any = { abilityFor: vi.fn(() => ability) }
    const mw = new AbilityMiddleware({ authorizer })
    const event = eventStub({ user: { id: 1 } })
    const next = vi.fn(async () => 'ok' as any)

    const res = await mw.handle(event, next as any)

    expect(authorizer.abilityFor).toHaveBeenCalledWith({ id: 1 })
    expect(event.getMetadataValue('ability')).toBe(ability)
    expect(res).toBe('ok')
  })
})

describe('authorize() guard', () => {
  const withAbility = (): any => eventStub({ meta: { ability: defineAbility((can) => can('read', 'Post')) } })

  it('passes when the ability allows the action', async () => {
    const next = vi.fn(async () => 'ok' as any)
    await expect(authorize('read', 'Post')(withAbility(), next as any)).resolves.toBe('ok')
    expect(next).toHaveBeenCalledOnce()
  })

  it('throws when the ability denies the action', async () => {
    await expect(authorize('delete', 'Post')(withAbility(), (async () => 'ok') as any)).rejects.toThrow(AuthorizationError)
  })

  it('throws when no ability is attached', async () => {
    await expect(authorize('read', 'Post')(eventStub(), (async () => 'ok') as any)).rejects.toThrow(AuthorizationError)
  })

  it('names an object subject as resource in the error', async () => {
    await expect(authorize('delete', { id: 1 } as any)(withAbility(), (async () => 'ok') as any)).rejects.toThrow('delete resource')
  })
})
