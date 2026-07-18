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
})
