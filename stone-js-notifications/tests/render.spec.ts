import { render } from '../src/render'

describe('a key and its params become text', () => {
  it('fills a declared template from the params', async () => {
    const message = render({
      template: 'welcome',
      params: { name: 'Alice' },
      locale: 'en',
      templates: { welcome: { subject: 'Welcome, {{ name }}', body: 'Hello {{ name }}.' } }
    })

    expect(message).toMatchObject({ subject: 'Welcome, Alice', body: 'Hello Alice.' })
  })

  it('leaves a placeholder the params do not answer', async () => {
    // Better a visible `{{ code }}` than a sentence with a hole in it: one gets reported, the other
    // reads as a typo somebody else made.
    const message = render({
      template: 'welcome',
      params: {},
      locale: 'en',
      templates: { welcome: 'Your code is {{ code }}.' }
    })

    expect(message.body).toBe('Your code is {{ code }}.')
  })

  it('lets a template be a function, for an application with its own engine', async () => {
    const message = render({
      template: 'welcome',
      params: { name: 'Alice' },
      locale: 'fr',
      templates: {
        welcome: (params, locale) => ({ subject: `[${locale}]`, body: `Bonjour ${String(params.name)}` })
      }
    })

    expect(message).toMatchObject({ subject: '[fr]', body: 'Bonjour Alice' })
  })

  it('takes a bare string as the body, and the key as the subject', async () => {
    const message = render({
      template: 'welcome',
      params: {},
      locale: 'en',
      templates: { welcome: 'Hello.' }
    })

    expect(message).toMatchObject({ subject: 'welcome', body: 'Hello.' })
  })
})

describe('the catalogue, when there is one', () => {
  const translator = (entries: Record<string, string>): any => ({
    t: (key: string) => entries[key] ?? key
  })

  it('looks up the subject and the body separately', async () => {
    // Two keys rather than one, because a subject and a body are translated separately by whoever
    // translates them, and a channel with no subject ignores it.
    const message = render({
      template: 'guardianship.consent_needed',
      params: {},
      locale: 'fr',
      translator: translator({
        'guardianship.consent_needed.subject': 'Consentement requis',
        'guardianship.consent_needed.body': 'Merci de confirmer.'
      })
    })

    expect(message).toMatchObject({ subject: 'Consentement requis', body: 'Merci de confirmer.' })
  })

  it('asks for the recipient locale, not the ambient one', async () => {
    const asked: any[] = []
    const message = render({
      template: 'welcome',
      params: { name: 'Alice' },
      locale: 'fr',
      translator: { t: (key: string, options?: any) => { asked.push(options); return `${key}!` } }
    })

    expect(asked[0]).toMatchObject({ lng: 'fr', name: 'Alice' })
    expect(message.locale).toBe('fr')
  })

  it('renders the key when the catalogue has neither half', async () => {
    // The lesson this encodes: an empty subject looks like a broken mail client and gets ignored for
    // months, while a visible key is obviously ours and gets reported the same day.
    const message = render({
      template: 'guardianship.consent_needed',
      params: {},
      locale: 'en',
      translator: translator({})
    })

    expect(message).toMatchObject({
      subject: 'guardianship.consent_needed',
      body: 'guardianship.consent_needed'
    })
  })

  it('keeps the half it found and names the key for the other', async () => {
    const message = render({
      template: 'welcome',
      params: {},
      locale: 'en',
      translator: translator({ 'welcome.body': 'Hello.' })
    })

    expect(message).toMatchObject({ subject: 'welcome', body: 'Hello.' })
  })

  it('is not consulted when the application declared the template outright', async () => {
    // Declared templates are the override as well as the fallback: an application that states one
    // means it.
    const message = render({
      template: 'welcome',
      params: {},
      locale: 'en',
      templates: { welcome: 'Declared.' },
      translator: translator({ 'welcome.body': 'From the catalogue.' })
    })

    expect(message.body).toBe('Declared.')
  })
})

describe('with nothing at all to render from', () => {
  it('renders the key, and carries the params through', async () => {
    const message = render({ template: 'welcome', params: { name: 'Alice' }, locale: 'en' })

    expect(message).toEqual({
      template: 'welcome',
      params: { name: 'Alice' },
      locale: 'en',
      subject: 'welcome',
      body: 'welcome'
    })
  })
})

describe('the edges of filling a template', () => {
  it('leaves a placeholder whose value is null', async () => {
    const message = render({
      template: 'welcome',
      params: { name: null },
      locale: 'en',
      templates: { welcome: 'Hello {{ name }}.' }
    })

    expect(message.body).toBe('Hello {{ name }}.')
  })

  it('takes a declared body with no subject', async () => {
    const message = render({
      template: 'welcome',
      params: {},
      locale: 'en',
      templates: { welcome: { body: 'Hello.' } }
    })

    expect(message).toMatchObject({ subject: 'welcome', body: 'Hello.' })
  })

  it('keeps the subject the catalogue found when the body is missing', async () => {
    const message = render({
      template: 'welcome',
      params: {},
      locale: 'en',
      translator: { t: (key: string) => (key === 'welcome.subject' ? 'Welcome' : key) }
    })

    expect(message).toMatchObject({ subject: 'Welcome', body: 'welcome' })
  })
})
