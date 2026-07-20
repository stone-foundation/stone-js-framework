import { Resource } from '../src/Resource'
import { defineResource } from '../src/defineResource'
import { ResourceContext } from '../src/declarations'

interface User { id: number, name: string, email: string, posts?: Array<{ id: number }> }

class UserResource extends Resource<User> {
  toArray (user: User, ctx: ResourceContext): Record<string, unknown> {
    return {
      id: user.id,
      name: user.name,
      email: this.when(ctx.self === true, user.email),
      posts: this.whenIncluded(ctx, 'posts', () => user.posts?.map((p) => p.id))
    }
  }
}

const resource = new UserResource()
const user: User = { id: 1, name: 'Bob', email: 'bob@x.io', posts: [{ id: 9 }] }

describe('Resource', () => {
  it('drops conditional fields by default', () => {
    expect(resource.item(user)).toEqual({ id: 1, name: 'Bob' })
  })

  it('includes conditional fields when enabled (when + whenIncluded)', () => {
    expect(resource.item(user, { self: true, include: ['posts'] })).toEqual({
      id: 1, name: 'Bob', email: 'bob@x.io', posts: [9]
    })
  })

  it('applies sparse fieldsets', () => {
    expect(resource.item(user, { self: true, fields: ['id', 'email'] })).toEqual({ id: 1, email: 'bob@x.io' })
  })

  it('transforms a collection', () => {
    expect(resource.collection([user, { id: 2, name: 'Ada', email: 'a@x.io' }])).toEqual([
      { id: 1, name: 'Bob' },
      { id: 2, name: 'Ada' }
    ])
  })

  it('wraps in an envelope, with and without meta, item vs collection', () => {
    expect(resource.response(user)).toEqual({ data: { id: 1, name: 'Bob' } })
    expect(resource.response([user], {}, { total: 1 })).toEqual({ data: [{ id: 1, name: 'Bob' }], meta: { total: 1 } })
  })

  it('when supports non-lazy values too', () => {
    class R extends Resource<User> {
      toArray (u: User, ctx: ResourceContext): Record<string, unknown> {
        return { id: u.id, flag: this.when(ctx.on === true, 'yes') }
      }
    }
    expect(new R().item(user, { on: true })).toEqual({ id: 1, flag: 'yes' })
    expect(new R().item(user)).toEqual({ id: 1 })
  })
})

describe('defineResource', () => {
  it('builds a functional resource with all the sugar', () => {
    const r = defineResource<User>((u) => ({ id: u.id, name: u.name }))
    expect(r.item(user, { fields: ['name'] })).toEqual({ name: 'Bob' })
    expect(r.collection([user])).toEqual([{ id: 1, name: 'Bob' }])
  })
})
