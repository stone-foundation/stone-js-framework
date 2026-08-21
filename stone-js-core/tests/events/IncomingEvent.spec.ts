import { IncomingEvent, IncomingEventOptions } from '../../src/events/IncomingEvent'

describe('IncomingEvent', () => {
  const baseSource = { platform: 'cli', rawContext: '', rawEvent: '', data: { user: 'stone' } }

  const baseOptions: IncomingEventOptions = {
    source: baseSource,
    locale: 'fr',
    metadata: {
      user: { id: 42, name: 'Mr. Stone' },
      flags: ['a', 'b']
    },
    type: 'custom_event',
    timeStamp: 1234567890
  }

  it('should create an instance with default and provided values', () => {
    const event = IncomingEvent.create(baseOptions)

    expect(event).toBeInstanceOf(IncomingEvent)
    expect(event.source).toEqual(baseSource)
    expect(event.locale).toBe('fr')
    expect(event.type).toBe('custom_event')
    expect(event.timeStamp).toBe(1234567890)
    expect(event.metadata).toEqual(baseOptions.metadata)
  })

  it('should fallback to default values when missing', () => {
    // @ts-expect-error - missing type
    const event = IncomingEvent.create({ source: baseSource, metadata: 12 })

    expect(event.locale).toBe('en')
    expect(event.type).toBe(IncomingEvent.INCOMING_EVENT)
    expect(event.timeStamp).toBeLessThanOrEqual(Date.now())
  })

  it('should return platform from source', () => {
    const event = IncomingEvent.create(baseOptions)
    expect(event.platform).toBe('cli')
  })

  it('should detect platform match using isPlatform()', () => {
    const event = IncomingEvent.create(baseOptions)
    expect(event.isPlatform('cli')).toBe(true)
    expect(event.isPlatform('web')).toBe(false)
  })

  it('should get nested metadata with get()', () => {
    const event = IncomingEvent.create(baseOptions)

    expect(event.get('user.id')).toBe(42)
    expect(event.get('user.name')).toBe('Mr. Stone')
    expect(event.get('flags[1]')).toBe('b')
    expect(event.get('not.exist')).toBeUndefined()
    expect(event.get('not.exist', 'fallback')).toBe('fallback')
  })

  it('should get metadata using getMetadataValue()', () => {
    const event = IncomingEvent.create(baseOptions)
    expect(event.getMetadataValue('user.id')).toBe(42)
  })

  it('should allow setting metadata values (setMetadataValue)', () => {
    const event = IncomingEvent.create(baseOptions)

    event.setMetadataValue('session.token', 'abc123')
    expect(event.is('session.token', 'abc123')).toBe(true)

    event.setMetadataValue({ app: 'stone', version: 1 })
    expect(event.get('app')).toBe('stone')
    expect(event.get('version')).toBe(1)
  })

  it('should clone itself with .clone()', () => {
    const event = IncomingEvent.create(baseOptions)
    const cloned = event.clone()

    expect(cloned).toBeInstanceOf(IncomingEvent)
    expect(cloned).not.toBe(event)
    expect(cloned.metadata).toEqual(event.metadata)
    expect(cloned.source).toBe(event.source)
  })

  describe('fingerprint', () => {
    const withMetadata = (metadata: Record<string, unknown>): IncomingEvent =>
      IncomingEvent.create({ source: baseSource, type: 'custom_event', metadata })

    it('is stable for the same event', () => {
      expect(withMetadata({ id: 1 }).fingerprint()).toBe(withMetadata({ id: 1 }).fingerprint())
    })

    it('ignores the moment the event was created', () => {
      // A server render and a browser render of the same event happen at different moments and have
      // to agree, which is the whole point of the key.
      const first = IncomingEvent.create({ source: baseSource, type: 't', metadata: { id: 1 }, timeStamp: 1 })
      const second = IncomingEvent.create({ source: baseSource, type: 't', metadata: { id: 1 }, timeStamp: 2 })

      expect(first.fingerprint()).toBe(second.fingerprint())
    })

    it('ignores the order metadata was written in', () => {
      // Two objects holding the same entries are the same event.
      expect(withMetadata({ a: 1, b: 2 }).fingerprint()).toBe(withMetadata({ b: 2, a: 1 }).fingerprint())
    })

    it('sorts nested keys too', () => {
      expect(withMetadata({ user: { id: 1, name: 'Ada' } }).fingerprint())
        .toBe(withMetadata({ user: { name: 'Ada', id: 1 } }).fingerprint())
    })

    it('keeps array order, because in an array order is meaning', () => {
      expect(withMetadata({ tags: ['a', 'b'] }).fingerprint())
        .not.toBe(withMetadata({ tags: ['b', 'a'] }).fingerprint())
    })

    it('separates two events carrying different things', () => {
      expect(withMetadata({ id: 1 }).fingerprint()).not.toBe(withMetadata({ id: 2 }).fingerprint())
    })

    it('separates two events of different types carrying the same thing', () => {
      const queued = IncomingEvent.create({ source: baseSource, type: 'queue', metadata: { id: 1 } })
      const timed = IncomingEvent.create({ source: baseSource, type: 'timer', metadata: { id: 1 } })

      expect(queued.fingerprint()).not.toBe(timed.fingerprint())
    })

    it('survives a payload no browser could base64 on its own', () => {
      // `btoa` only accepts latin1, so an accent or a non-latin script would throw without the
      // UTF-8 step. A key that throws is worse than a key that collides.
      expect(() => withMetadata({ name: 'Évens', city: '東京' }).fingerprint()).not.toThrow()
      expect(withMetadata({ name: 'Évens' }).fingerprint()).not.toBe(withMetadata({ name: 'Evens' }).fingerprint())
    })
  })
})
