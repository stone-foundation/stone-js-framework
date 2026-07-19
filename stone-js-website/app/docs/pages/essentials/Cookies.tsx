import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/essentials/cookies'

/**
 * Essentials: cookies.
 */
@Page(PATH, { layout: 'docs' })
export class Cookies implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Cookies',
      description: 'Read cookies from the event and set them on the response, with the security options that matter.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Essentials' title='Cookies' />
        <Lead>
          Cookies are read from the incoming event and written on the outgoing response, both through
          a small, uniform API. As with everything else, your handler works with values, not with raw
          header strings.
        </Lead>

        <H2>Reading cookies</H2>
        <Code file='app/Session.ts'>{`show (event: IncomingHttpEvent) {
  const theme = event.cookies.get('theme', 'light')   // name, default
  const seen = event.cookies.has('seen')
  return { theme, seen }
}`}</Code>

        <H2>Setting cookies</H2>
        <p>
          Set a cookie on a response, with the options a cookie should have in production: an expiry,
          <code> httpOnly</code>, <code>secure</code>, and a <code>sameSite</code> policy.
        </p>
        <Code file='app/Session.ts'>{`import { jsonHttpResponse } from '@stone-js/http-core'

const response = jsonHttpResponse({ ok: true })
response.setCookie('theme', 'dark', {
  maxAge: 60 * 60 * 24 * 365,   // one year, in seconds
  httpOnly: true,
  secure: true,
  sameSite: 'lax'
})
return response`}</Code>

        <H2>Cookie options</H2>
        <PropsTable rows={[
          { name: 'maxAge', type: 'number', desc: 'Lifetime in seconds.' },
          { name: 'expires', type: 'Date', desc: 'Absolute expiry (alternative to maxAge).' },
          { name: 'httpOnly', type: 'boolean', default: 'false', desc: 'Hide the cookie from client-side JavaScript.' },
          { name: 'secure', type: 'boolean', default: 'false', desc: 'Send only over HTTPS.' },
          { name: 'sameSite', type: "'strict' | 'lax' | 'none'", default: "'lax'", desc: 'Cross-site sending policy.' },
          { name: 'path', type: 'string', default: "'/'", desc: 'The paths the cookie applies to.' },
          { name: 'domain', type: 'string', desc: 'The host the cookie is scoped to.' }
        ]} />

        <Callout kind='important' title='Secure defaults for anything sensitive'>
          For session or auth cookies, set <code>httpOnly</code>, <code>secure</code> and a strict
          <code> sameSite</code>. Better still, prefer stateless tokens (see Auth) so there is no
          server-side session to protect at all.
        </Callout>

        <SeeAlso links={[
          { title: 'Incoming event', path: '/docs/essentials/incoming-event' },
          { title: 'Outgoing response', path: '/docs/essentials/outgoing-response' },
          { title: 'Auth & authorization', path: '/docs/extensions/auth' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
