import { defineAbility } from '../src/casl'
import { Authorizer } from '../src/Authorizer'
import { AuthorizationError } from '../src/errors/AuthorizationError'

interface User { role: string }

const resolveAbility = (user: unknown): any => defineAbility((can) => {
  const role = (user as User | undefined)?.role
  if (role === 'admin') { can('manage', 'all') } else { can('read', 'Post') }
})

describe('Authorizer', () => {
  const authorizer = Authorizer.create(resolveAbility)

  it('grants an admin everything and a user only reads', () => {
    expect(authorizer.can({ role: 'admin' }, 'delete', 'Post')).toBe(true)
    expect(authorizer.can({ role: 'user' }, 'read', 'Post')).toBe(true)
    expect(authorizer.can({ role: 'user' }, 'delete', 'Post')).toBe(false)
    expect(authorizer.cannot({ role: 'user' }, 'delete', 'Post')).toBe(true)
  })

  it('authorize() throws for a denied action, passes for an allowed one', () => {
    expect(() => authorizer.authorize({ role: 'user' }, 'read', 'Post')).not.toThrow()
    expect(() => authorizer.authorize({ role: 'user' }, 'delete', 'Post')).toThrow(AuthorizationError)
  })

  it('names the subject in the error (string type and class instance)', () => {
    class Post {}
    expect(() => authorizer.authorize({ role: 'user' }, 'delete', 'Invoice')).toThrow('delete Invoice')
    expect(() => authorizer.authorize({ role: 'user' }, 'delete', new Post())).toThrow('delete Post')
  })

  it('defaults to deny-all when no resolver is configured', () => {
    const denyAll = Authorizer.create()
    expect(denyAll.can({ role: 'admin' }, 'read', 'Post')).toBe(false)
    expect(() => denyAll.authorize(undefined, 'read', 'Post')).toThrow(AuthorizationError)
  })

  it('exposes the built ability for manual (ABAC) checks', () => {
    const ability = authorizer.abilityFor({ role: 'admin' })
    expect(ability.can('update', 'Comment')).toBe(true)
  })
})
