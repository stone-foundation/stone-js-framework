import { RenderedNotification, TemplateInput } from './declarations'

/** The shape this module needs from a translator, duck-typed so i18n is never imported. */
export interface TranslatorLike {
  t: (key: string, options?: Record<string, unknown>) => string
}

/** What rendering is given, so it can be tested without an application around it. */
export interface RenderContext {
  /** The template key. */
  template: string
  /** What to render it with. */
  params: Record<string, unknown>
  /** The language the **recipient** reads. */
  locale: string
  /** Templates the application declared. */
  templates?: Record<string, TemplateInput>
  /** The catalogue, when `@stone-js/i18n` is enabled. */
  translator?: TranslatorLike
}

/**
 * A template key and its params, become text in the recipient's language.
 *
 * **The locale is the recipient's, never the request's.** A French-speaking guardian invited by an
 * English-speaking member of staff reads French. Getting that backwards is invisible in every test
 * written by one person in one language, and obvious to the person who receives it.
 *
 * Three sources, in order: a template the application declared outright, the translation catalogue,
 * and failing both the key itself.
 *
 * That last fallback is the point. A missing translation renders its **key**, never an empty string:
 * an empty subject looks like a broken mail client and gets ignored for months, while
 * `guardianship.consent_needed` is visibly ours and gets reported the same day.
 *
 * @param context - What to render, and what to render it from.
 * @returns The rendered notification.
 */
export function render (context: RenderContext): RenderedNotification {
  const { template, params, locale } = context
  const declared = context.templates?.[template]

  if (declared !== undefined) {
    const { subject, body } = fromDeclared(declared, params, locale)

    return { template, params, locale, subject: subject ?? template, body }
  }

  const translated = context.translator === undefined
    ? undefined
    : fromCatalogue(context.translator, template, params, locale)

  return {
    template,
    params,
    locale,
    subject: translated?.subject ?? template,
    body: translated?.body ?? template
  }
}

/**
 * What the application declared for this key.
 *
 * @param declared - The template.
 * @param params - What to render it with.
 * @param locale - The recipient's language.
 * @returns The subject and the body.
 */
function fromDeclared (
  declared: TemplateInput,
  params: Record<string, unknown>,
  locale: string
): { subject?: string, body: string } {
  if (typeof declared === 'function') { return declared(params, locale) }
  if (typeof declared === 'string') { return { body: interpolate(declared, params) } }

  return {
    subject: declared.subject === undefined ? undefined : interpolate(declared.subject, params),
    body: interpolate(declared.body, params)
  }
}

/**
 * What the catalogue holds for this key, under `<key>.subject` and `<key>.body`.
 *
 * Two keys rather than one, because a subject and a body are translated separately by whoever
 * translates them, and a channel with no subject simply ignores it.
 *
 * @param translator - The catalogue.
 * @param template - The key.
 * @param params - What to render it with.
 * @param locale - The recipient's language.
 * @returns The subject and the body, or nothing when the catalogue has neither.
 */
function fromCatalogue (
  translator: TranslatorLike,
  template: string,
  params: Record<string, unknown>,
  locale: string
): { subject?: string, body?: string } | undefined {
  const subjectKey = `${template}.subject`
  const bodyKey = `${template}.body`

  const subject = translator.t(subjectKey, { ...params, lng: locale })
  const body = translator.t(bodyKey, { ...params, lng: locale })

  // A catalogue that cannot find a key answers the key, which is exactly the signal wanted here:
  // nothing was translated, so say nothing rather than repeating a key twice.
  const found = subject !== subjectKey || body !== bodyKey

  return found
    ? { subject: subject === subjectKey ? undefined : subject, body: body === bodyKey ? undefined : body }
    : undefined
}

/**
 * Fill `{{ name }}` from the params.
 *
 * The smallest thing that works for a declared template, and not a template engine: an application
 * that wants one renders it itself, through the function form.
 *
 * @param text - The template text.
 * @param params - What to fill it from.
 * @returns The filled text.
 */
function interpolate (text: string, params: Record<string, unknown>): string {
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, name: string) => {
    return primitive(params[name]) ?? match
  })
}

/**
 * A parameter as text, or nothing when it is not something a message can carry.
 *
 * An object or an array would stringify to `[object Object]` in the middle of a sentence somebody
 * reads. Leaving the placeholder is better: it is visibly unfinished, and it gets reported.
 *
 * @param value - The parameter.
 * @returns Its text, or nothing.
 */
function primitive (value: unknown): string | undefined {
  if (value === undefined || value === null) { return undefined }
  if (typeof value === 'object') { return undefined }

  return String(value as string | number | boolean | bigint | symbol)
}
