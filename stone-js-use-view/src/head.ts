/**
 * Framework-agnostic head serialization for SSR/SSG.
 *
 * Turns a {@link HeadContext} into an HTML string suitable for injection into a document
 * `<head>`. Attribute values AND attribute names are escaped so a head built from
 * untrusted data cannot inject markup or break out of an attribute.
 */
import { HeadContext, HeadEntry } from './declarations'

const ATTR_ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

/**
 * Escape a string for safe use inside an HTML attribute value or text node.
 *
 * @param value - The raw value.
 * @returns The escaped value.
 */
export function escapeHtml (value: string): string {
  return value.replace(/[&<>"']/g, (char) => ATTR_ESCAPE[char])
}

/**
 * Escape an attribute NAME: only allow safe attribute-name characters, drop the rest.
 * Prevents attribute injection when a head entry is built from untrusted keys.
 *
 * @param name - The raw attribute name.
 * @returns The sanitized attribute name (may be empty).
 */
export function sanitizeAttrName (name: string): string {
  return name.replace(/[^A-Za-z0-9:_-]/g, '')
}

/**
 * Serialize a single tag with attributes (and optional text content).
 *
 * @param tag - The tag name.
 * @param attrs - The attributes (name/value pairs). `content`/`children` keys are treated as text.
 * @returns The serialized HTML tag.
 */
function serializeTag (tag: string, attrs: HeadEntry): string {
  const parts: string[] = []
  let text = ''

  for (const [rawName, rawValue] of Object.entries(attrs)) {
    if (rawName === 'content' && (tag === 'style' || tag === 'script')) {
      text = String(rawValue ?? '')
      continue
    }
    const name = sanitizeAttrName(rawName)
    if (name.length === 0 || rawValue === undefined || rawValue === null || rawValue === false) { continue }
    if (rawValue === true) { parts.push(name); continue }
    parts.push(`${name}="${escapeHtml(String(rawValue))}"`)
  }

  const attrString = parts.length > 0 ? ` ${parts.join(' ')}` : ''

  // Void elements never carry text content.
  if (tag === 'meta' || tag === 'link' || tag === 'base') {
    return `<${tag}${attrString}>`
  }

  return `<${tag}${attrString}>${text}</${tag}>`
}

/**
 * Serialize a {@link HeadContext} to an HTML string for the document `<head>`.
 *
 * Note: `style`/`script` inline content is NOT HTML-escaped (CSS/JS may legitimately
 * contain `>` or `&`); such content must therefore only come from trusted application
 * code, never from user input. Meta/link/script attribute names and values are escaped.
 *
 * @param head - The head context to serialize.
 * @returns The serialized `<head>` fragment.
 */
export function serializeHead (head: HeadContext): string {
  const out: string[] = []

  const title = head.titleTemplate !== undefined && head.title !== undefined
    ? head.titleTemplate.replace('%s', head.title)
    : head.title

  if (typeof title === 'string') {
    out.push(`<title>${escapeHtml(title)}</title>`)
  }

  if (head.base?.href !== undefined) {
    out.push(serializeTag('base', { href: head.base.href, target: head.base.target }))
  }

  if (typeof head.description === 'string') {
    out.push(serializeTag('meta', { name: 'description', content: head.description }))
  }

  for (const meta of head.metas ?? []) { out.push(serializeTag('meta', meta)) }
  for (const link of head.links ?? []) { out.push(serializeTag('link', link)) }
  for (const style of head.styles ?? []) { out.push(serializeTag('style', style)) }
  for (const script of head.scripts ?? []) { out.push(serializeTag('script', script)) }

  // JSON-LD structured data: serialized as JSON (not HTML-escaped) inside a typed script.
  // The `<` in the payload is neutralized so it cannot close the tag.
  for (const data of head.jsonLd ?? []) {
    const json = JSON.stringify(data).replace(/</g, '\\u003C')
    out.push(`<script type="application/ld+json">${json}</script>`)
  }

  return out.join('\n')
}

/**
 * Serialize a map of element attributes to a string (for `<html>` / `<body>`),
 * with names sanitized and values escaped.
 *
 * @param attributes - The attribute map.
 * @returns The serialized attribute string (leading space included when non-empty).
 */
export function serializeAttributes (attributes: Record<string, string> | undefined): string {
  if (attributes === undefined) { return '' }
  const parts: string[] = []
  for (const [rawName, value] of Object.entries(attributes)) {
    const name = sanitizeAttrName(rawName)
    if (name.length > 0) { parts.push(`${name}="${escapeHtml(String(value))}"`) }
  }
  return parts.length > 0 ? ` ${parts.join(' ')}` : ''
}

/**
 * Replace a placeholder in a template with content, safe against `String.replace`
 * special replacement patterns (`$&`, `` $` ``, `$'`, `$1`…) that would otherwise be
 * interpreted when the content contains a `$`.
 *
 * @param template - The template string.
 * @param placeholder - The placeholder to replace (first occurrence).
 * @param content - The literal content to insert.
 * @returns The template with the placeholder replaced literally.
 */
export function replacePlaceholder (template: string, placeholder: string, content: string): string {
  return template.replace(placeholder, () => content)
}
