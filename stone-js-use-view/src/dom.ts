/**
 * Framework-agnostic head application for the live DOM (CSR) and for an HTML string (SSR).
 *
 * The counterpart of {@link serializeHead}: where `serializeHead` builds a `<head>` fragment
 * for first render, these helpers reconcile a {@link HeadContext} against an already-live
 * document (client navigation) or splice it into a rendered HTML template (server response).
 *
 * Nothing here is React-specific — it uses only the standard DOM API and string operations —
 * so every Stone.js view engine (use-react today, use-vue next) shares the exact same head
 * behavior instead of re-implementing it. Elements Stone owns are tagged with
 * {@link STONE_HEAD_ATTR} so a client update only ever touches head nodes it created.
 */
import {
  HeadContext,
  MetaDescriptor,
  LinkDescriptor,
  StyleDescriptor,
  ScriptDescriptor
} from './declarations'
import { escapeHtml, serializeHead, serializeAttributes, replacePlaceholder } from './head'

/**
 * Marker attribute placed on every head element Stone.js manages, so client-side updates
 * only touch nodes Stone created (never the template's own tags).
 */
export const STONE_HEAD_ATTR = 'data-stone-head'

/**
 * Compute the effective document title from a head context, applying the title template.
 *
 * @param head - The head context.
 * @returns The resolved title, or `undefined` when no title is set.
 */
function resolveTitle (head: HeadContext): string | undefined {
  return head.titleTemplate !== undefined && head.title !== undefined
    ? head.titleTemplate.replace('%s', head.title)
    : head.title
}

/**
 * Apply (create or update) a `<meta>` tag in the document head.
 *
 * @param document - The target document.
 * @param meta - The meta descriptor.
 */
export function applyMeta (document: Document, meta: MetaDescriptor): void {
  const metaProp = typeof meta.property === 'string' ? `meta[property="${meta.property}"]` : null
  const selector = typeof meta.name === 'string' ? `meta[name="${meta.name}"]` : metaProp

  if (selector === null) { return }

  const existing = document.head.querySelector<HTMLMetaElement>(`${selector}[${STONE_HEAD_ATTR}]`)

  if (existing !== null) {
    if (existing.content !== meta.content) { existing.content = meta.content }
  } else {
    const el = document.createElement('meta')
    if (typeof meta.name === 'string') { el.setAttribute('name', meta.name) }
    if (typeof meta.property === 'string') { el.setAttribute('property', meta.property) }
    el.setAttribute('content', meta.content)
    el.setAttribute(STONE_HEAD_ATTR, '')
    document.head.appendChild(el)
  }
}

/**
 * Set an attribute, coercing the (possibly unknown) value to string.
 *
 * @param el - The target element.
 * @param key - The attribute name.
 * @param value - The attribute value.
 */
function setAttr (el: Element, key: string, value: unknown): void {
  el.setAttribute(key, String(value))
}

/**
 * Apply (create or update) a `<link>` tag in the document head.
 *
 * @param document - The target document.
 * @param link - The link descriptor.
 */
export function applyLink (document: Document, link: LinkDescriptor): void {
  const selector = `link[rel="${link.rel}"][href="${link.href}"][${STONE_HEAD_ATTR}]`
  const existing = document.head.querySelector<HTMLLinkElement>(selector)

  if (existing !== null) {
    const needsUpdate = Object.entries(link).some(([key, value]) => existing.getAttribute(key) !== String(value))
    if (needsUpdate) {
      for (const [key, value] of Object.entries(link)) { setAttr(existing, key, value) }
      existing.setAttribute(STONE_HEAD_ATTR, '')
    }
  } else {
    const el = document.createElement('link')
    for (const [key, value] of Object.entries(link)) { setAttr(el, key, value) }
    el.setAttribute(STONE_HEAD_ATTR, '')
    document.head.appendChild(el)
  }
}

/**
 * Set a map of attributes on an element, treating booleans as presence flags.
 *
 * @param el - The target element.
 * @param attrs - The attribute map.
 */
function updateAttributes (el: HTMLElement, attrs: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(attrs)) {
    if (typeof value === 'boolean') {
      value ? el.setAttribute(key, '') : el.removeAttribute(key)
    } else {
      el.setAttribute(key, String(value))
    }
  }
  el.setAttribute(STONE_HEAD_ATTR, '')
}

/**
 * Check if an element's attributes differ from the desired map.
 *
 * @param el - The element to check.
 * @param attrs - The desired attributes.
 * @returns True when at least one attribute needs updating.
 */
function needsAttributeUpdate (el: HTMLElement, attrs: Record<string, unknown>): boolean {
  return Object.entries(attrs).some(([key, value]) => {
    const attr = el.getAttribute(key)
    return typeof value === 'boolean' ? attr !== '' : attr !== String(value)
  })
}

/**
 * Apply (create or update) a `<script>` tag in the document head.
 *
 * @param document - The target document.
 * @param script - The script descriptor.
 */
export function applyScript (document: Document, script: ScriptDescriptor): void {
  const selector = `script[src="${script.src ?? ''}"][${STONE_HEAD_ATTR}]`
  const existing = document.head.querySelector<HTMLScriptElement>(selector)

  if (existing !== null) {
    if (needsAttributeUpdate(existing, script)) { updateAttributes(existing, script) }
  } else {
    const el = document.createElement('script')
    updateAttributes(el, script)
    document.head.appendChild(el)
  }
}

/**
 * Apply an inline `<style>` tag in the document head (deduplicated by content).
 *
 * @param document - The target document.
 * @param style - The style descriptor.
 */
export function applyStyle (document: Document, style: StyleDescriptor): void {
  const existing = [...document.head.querySelectorAll<HTMLStyleElement>(`style[${STONE_HEAD_ATTR}]`)]
    .find(s => s.textContent === style.content)

  if (existing === undefined) {
    const el = document.createElement('style')
    if (typeof style.type === 'string') { el.setAttribute('type', style.type) }
    if (typeof style.media === 'string') { el.setAttribute('media', style.media) }
    el.textContent = style.content
    el.setAttribute(STONE_HEAD_ATTR, '')
    document.head.appendChild(el)
  }
}

/**
 * Append a JSON-LD structured-data block to the document head.
 *
 * @param document - The target document.
 * @param data - The JSON-LD object.
 */
export function applyJsonLd (document: Document, data: Record<string, unknown>): void {
  const script = document.createElement('script')
  script.setAttribute('type', 'application/ld+json')
  script.setAttribute(STONE_HEAD_ATTR, 'true')
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}

/**
 * Apply an attribute map to an element (used for `<html>` / `<body>` attributes).
 *
 * @param element - The target element (no-op when null).
 * @param attributes - The attribute map (no-op when undefined).
 */
export function applyElementAttributes (element: Element | null, attributes?: Record<string, string>): void {
  if (element === null || attributes === undefined) { return }
  for (const [name, value] of Object.entries(attributes)) { element.setAttribute(name, value) }
}

/**
 * Reconcile a {@link HeadContext} against the live document head (client-side rendering).
 *
 * Title, description, metas, links, styles, scripts, JSON-LD and `<html>`/`<body>` attributes
 * are all applied. Existing Stone-managed nodes are updated in place; new ones are created and
 * tagged with {@link STONE_HEAD_ATTR}.
 *
 * @param document - The target document.
 * @param head - The head context to apply.
 */
export function applyHeadToDocument (document: Document, head: HeadContext): void {
  const title = resolveTitle(head)
  if (typeof title === 'string' && document.title !== title) { document.title = title }

  const metas = [...(head.metas ?? [])]
  if (typeof head.description === 'string') {
    metas.push({ name: 'description', content: head.description })
  }

  metas.forEach(v => applyMeta(document, v))
  head.links?.forEach(v => applyLink(document, v))
  head.styles?.forEach(v => applyStyle(document, v))
  head.scripts?.forEach(v => applyScript(document, v))
  head.jsonLd?.forEach(v => applyJsonLd(document, v))

  applyElementAttributes(document.documentElement, head.htmlAttributes)
  if (document.body !== null) { applyElementAttributes(document.body, head.bodyAttributes) }
}

/**
 * Splice a {@link HeadContext} into a rendered HTML string (server-side rendering).
 *
 * The `<title>` is replaced in place; everything else is rendered by the agnostic
 * {@link serializeHead} (which escapes attribute names/values) and injected at the
 * `<!--app-head-->` placeholder. Optional `<html>`/`<body>` attributes are merged in.
 * All replacements use literal replacers so content containing `$&`/`$'`/`$1` is inserted
 * verbatim rather than interpreted as a `String.replace` pattern.
 *
 * @param head - The head context to apply.
 * @param html - The HTML template/string to inject into.
 * @returns The HTML string with the head applied.
 */
export function applyHeadToHtml (head: HeadContext, html: string): string {
  if (html === undefined || html === null || html === '') { return html }
  if (head === undefined || head === null || Object.keys(head).length === 0) { return html }

  const title = resolveTitle(head)
  if (typeof title === 'string') {
    html = html.replace(/<title>.*?<\/title>/i, () => `<title>${escapeHtml(title)}</title>`)
  }

  // Title is handled above; exclude it (and html/body attrs) so serializeHead does not duplicate it.
  const { title: _t, titleTemplate: _tt, htmlAttributes, bodyAttributes, ...rest } = head
  const headString = serializeHead(rest).concat('\n<!--app-head-->')
  html = replacePlaceholder(html, '<!--app-head-->', headString)

  const htmlAttrs = serializeAttributes(htmlAttributes)
  if (htmlAttrs.length > 0) { html = html.replace(/<html\b([^>]*)>/i, (_m, existing) => `<html${String(existing)}${htmlAttrs}>`) }
  const bodyAttrs = serializeAttributes(bodyAttributes)
  if (bodyAttrs.length > 0) { html = html.replace(/<body\b([^>]*)>/i, (_m, existing) => `<body${String(existing)}${bodyAttrs}>`) }

  return html
}
