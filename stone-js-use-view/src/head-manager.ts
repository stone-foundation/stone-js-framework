/**
 * Fluent, high-level head/meta management for Stone.js views.
 *
 * Instead of hand-writing `metas: [{ property: 'og:title', content }]`, pages build their
 * head declaratively:
 *
 * ```ts
 * head ({ data }) {
 *   return createHead()
 *     .title(data.post.title)
 *     .titleTemplate('%s — Stone.js')
 *     .description(data.post.excerpt)
 *     .canonical(`https://stonejs.dev/blog/${data.post.slug}`)
 *     .og({ type: 'article', image: data.post.cover, siteName: 'Stone.js' })
 *     .twitter({ card: 'summary_large_image', site: '@stonejs' })
 *     .robots({ index: true, follow: true })
 *     .jsonLd({ '@context': 'https://schema.org', '@type': 'Article', headline: data.post.title })
 *     .toContext()
 * }
 * ```
 *
 * A page may also return a plain {@link HeadContext} — the builder is optional sugar over it.
 * The imperative `defineHead()` mirrors the builder for functional-first users.
 */
import {
  HeadContext,
  MetaDescriptor,
  LinkDescriptor,
  ScriptDescriptor,
  StyleDescriptor
} from './declarations'

/**
 * Open Graph options. Emitted as `property="og:*"` meta tags.
 */
export interface OpenGraphOptions {
  title?: string
  description?: string
  type?: string
  url?: string
  siteName?: string
  locale?: string
  image?: string | { url: string, width?: number, height?: number, alt?: string, type?: string }
  [key: string]: unknown
}

/**
 * Twitter card options. Emitted as `name="twitter:*"` meta tags.
 */
export interface TwitterOptions {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player'
  site?: string
  creator?: string
  title?: string
  description?: string
  image?: string
  imageAlt?: string
  [key: string]: unknown
}

/**
 * Robots directive options. Emitted as `<meta name="robots">`.
 */
export interface RobotsOptions {
  index?: boolean
  follow?: boolean
  noarchive?: boolean
  nosnippet?: boolean
  maxSnippet?: number
  maxImagePreview?: 'none' | 'standard' | 'large'
}

/**
 * A fluent head builder. Every method returns `this` for chaining; {@link toContext}
 * produces the final {@link HeadContext}.
 */
export class HeadManager {
  private readonly context: HeadContext

  /**
   * Create a HeadManager, optionally seeded from an existing context.
   *
   * @param initial - An initial head context to extend.
   */
  constructor (initial: HeadContext = {}) {
    this.context = {
      metas: [],
      links: [],
      scripts: [],
      styles: [],
      jsonLd: [],
      ...structuredCloneSafe(initial)
    }
  }

  /**
   * Set the document title.
   *
   * @param value - The title text.
   */
  title (value: string): this {
    this.context.title = value
    return this
  }

  /**
   * Set a title template, e.g. `'%s — Stone.js'` where `%s` is replaced by the title.
   *
   * @param template - The template string containing `%s`.
   */
  titleTemplate (template: string): this {
    this.context.titleTemplate = template
    return this
  }

  /**
   * Set the meta description (and the `og:description` fallback source).
   *
   * @param value - The description text.
   */
  description (value: string): this {
    this.context.description = value
    return this
  }

  /**
   * Set the document character set (`<meta charset>`).
   *
   * @param value - The charset (default `utf-8`).
   */
  charset (value: string = 'utf-8'): this {
    return this.meta({ charset: value })
  }

  /**
   * Set the viewport meta (default mobile-friendly value).
   *
   * @param value - The viewport content.
   */
  viewport (value: string = 'width=device-width, initial-scale=1'): this {
    return this.meta({ name: 'viewport', content: value })
  }

  /**
   * Set the theme color meta.
   *
   * @param value - A CSS color.
   */
  themeColor (value: string): this {
    return this.meta({ name: 'theme-color', content: value })
  }

  /**
   * Add or replace a raw meta descriptor (deduped by `name`/`property`/`charset`).
   *
   * @param descriptor - The meta descriptor.
   */
  meta (descriptor: MetaDescriptor | Record<string, unknown>): this {
    const metas = (this.context.metas ??= [])
    const key = metaKey(descriptor)
    const index = metas.findIndex((m) => metaKey(m) === key)
    if (index >= 0) { metas[index] = descriptor as MetaDescriptor } else { metas.push(descriptor as MetaDescriptor) }
    return this
  }

  /**
   * Add a link descriptor (deduped by `rel`+`href`).
   *
   * @param descriptor - The link descriptor.
   */
  link (descriptor: LinkDescriptor): this {
    const links = (this.context.links ??= [])
    const key = `${descriptor.rel}:${descriptor.href}`
    if (!links.some((l) => `${l.rel}:${l.href}` === key)) { links.push(descriptor) }
    return this
  }

  /**
   * Set the canonical URL (`<link rel="canonical">`).
   *
   * @param href - The canonical URL.
   */
  canonical (href: string): this {
    return this.link({ rel: 'canonical', href })
  }

  /**
   * Add a preload/prefetch/modulepreload link.
   *
   * @param href - The resource URL.
   * @param as - The `as` attribute (e.g. `script`, `style`, `font`, `image`).
   * @param rel - The relationship (default `preload`).
   */
  preload (href: string, as?: string, rel: 'preload' | 'prefetch' | 'modulepreload' = 'preload'): this {
    return this.link(as !== undefined ? { rel, href, as } : { rel, href })
  }

  /**
   * Add a stylesheet link.
   *
   * @param href - The stylesheet URL.
   * @param attrs - Extra attributes (e.g. `media`).
   */
  stylesheet (href: string, attrs: Record<string, unknown> = {}): this {
    return this.link({ rel: 'stylesheet', href, ...attrs })
  }

  /**
   * Set an alternate link (e.g. hreflang or RSS feed).
   *
   * @param href - The alternate URL.
   * @param attrs - Extra attributes (e.g. `{ hreflang: 'fr' }`, `{ type: 'application/rss+xml' }`).
   */
  alternate (href: string, attrs: Record<string, unknown> = {}): this {
    return this.link({ rel: 'alternate', href, ...attrs })
  }

  /**
   * Add a script descriptor (external via `src`, or inline via `content`).
   *
   * @param descriptor - The script descriptor.
   */
  script (descriptor: ScriptDescriptor): this {
    (this.context.scripts ??= []).push(descriptor)
    return this
  }

  /**
   * Add an inline style block.
   *
   * @param css - The CSS text.
   * @param attrs - Extra attributes (e.g. `media`).
   */
  style (css: string, attrs: Record<string, unknown> = {}): this {
    const descriptor: StyleDescriptor = { content: css, ...attrs }
    ;(this.context.styles ??= []).push(descriptor)
    return this
  }

  /**
   * Set the `<base>` element.
   *
   * @param href - The base href.
   * @param target - The base target.
   */
  base (href: string, target?: string): this {
    this.context.base = target !== undefined ? { href, target } : { href }
    return this
  }

  /**
   * Set robots directives (`<meta name="robots">`).
   *
   * @param options - Robots directives.
   */
  robots (options: RobotsOptions): this {
    const parts: string[] = []
    if (options.index !== undefined) { parts.push(options.index ? 'index' : 'noindex') }
    if (options.follow !== undefined) { parts.push(options.follow ? 'follow' : 'nofollow') }
    if (options.noarchive === true) { parts.push('noarchive') }
    if (options.nosnippet === true) { parts.push('nosnippet') }
    if (options.maxSnippet !== undefined) { parts.push(`max-snippet:${options.maxSnippet}`) }
    if (options.maxImagePreview !== undefined) { parts.push(`max-image-preview:${options.maxImagePreview}`) }
    return this.meta({ name: 'robots', content: parts.join(', ') })
  }

  /**
   * Add Open Graph meta tags. Falls back to the current title/description when omitted.
   *
   * @param options - Open Graph options.
   */
  og (options: OpenGraphOptions): this {
    const title = options.title ?? this.context.title
    const description = options.description ?? this.context.description

    if (title !== undefined) { this.meta({ property: 'og:title', content: title }) }
    if (description !== undefined) { this.meta({ property: 'og:description', content: description }) }
    if (options.type !== undefined) { this.meta({ property: 'og:type', content: options.type }) }
    if (options.url !== undefined) { this.meta({ property: 'og:url', content: options.url }) }
    if (options.siteName !== undefined) { this.meta({ property: 'og:site_name', content: options.siteName }) }
    if (options.locale !== undefined) { this.meta({ property: 'og:locale', content: options.locale }) }

    if (typeof options.image === 'string') {
      this.meta({ property: 'og:image', content: options.image })
    } else if (options.image !== undefined) {
      const img = options.image
      this.meta({ property: 'og:image', content: img.url })
      if (img.width !== undefined) { this.meta({ property: 'og:image:width', content: String(img.width) }) }
      if (img.height !== undefined) { this.meta({ property: 'og:image:height', content: String(img.height) }) }
      if (img.alt !== undefined) { this.meta({ property: 'og:image:alt', content: img.alt }) }
      if (img.type !== undefined) { this.meta({ property: 'og:image:type', content: img.type }) }
    }

    return this
  }

  /**
   * Add Twitter card meta tags. Falls back to the current title/description when omitted.
   *
   * @param options - Twitter card options.
   */
  twitter (options: TwitterOptions): this {
    const title = options.title ?? this.context.title
    const description = options.description ?? this.context.description

    this.meta({ name: 'twitter:card', content: options.card ?? 'summary_large_image' })
    if (options.site !== undefined) { this.meta({ name: 'twitter:site', content: options.site }) }
    if (options.creator !== undefined) { this.meta({ name: 'twitter:creator', content: options.creator }) }
    if (title !== undefined) { this.meta({ name: 'twitter:title', content: title }) }
    if (description !== undefined) { this.meta({ name: 'twitter:description', content: description }) }
    if (options.image !== undefined) { this.meta({ name: 'twitter:image', content: options.image }) }
    if (options.imageAlt !== undefined) { this.meta({ name: 'twitter:image:alt', content: options.imageAlt }) }

    return this
  }

  /**
   * Add a JSON-LD structured-data block (`<script type="application/ld+json">`).
   *
   * @param data - The JSON-LD object.
   */
  jsonLd (data: Record<string, unknown>): this {
    (this.context.jsonLd ??= []).push(data)
    return this
  }

  /**
   * Set attributes on the `<html>` element.
   *
   * @param attributes - Attribute map (e.g. `{ lang: 'en' }`).
   */
  htmlAttributes (attributes: Record<string, string>): this {
    this.context.htmlAttributes = { ...this.context.htmlAttributes, ...attributes }
    return this
  }

  /**
   * Set attributes on the `<body>` element.
   *
   * @param attributes - Attribute map.
   */
  bodyAttributes (attributes: Record<string, string>): this {
    this.context.bodyAttributes = { ...this.context.bodyAttributes, ...attributes }
    return this
  }

  /**
   * Merge another head context (or manager) into this one. Later values win; metas/links
   * are deduped. Enables hierarchical heads (layout head + page head).
   *
   * @param other - The head context or manager to merge in.
   */
  merge (other: HeadContext | HeadManager): this {
    const ctx = other instanceof HeadManager ? other.toContext() : other

    if (ctx.title !== undefined) { this.context.title = ctx.title }
    if (ctx.titleTemplate !== undefined) { this.context.titleTemplate = ctx.titleTemplate }
    if (ctx.description !== undefined) { this.context.description = ctx.description }
    if (ctx.base !== undefined) { this.context.base = ctx.base }
    ctx.metas?.forEach((m) => this.meta(m))
    ctx.links?.forEach((l) => this.link(l))
    ctx.scripts?.forEach((s) => this.script(s))
    ctx.styles?.forEach((s) => { (this.context.styles ??= []).push(s) })
    ctx.jsonLd?.forEach((j) => this.jsonLd(j))
    if (ctx.htmlAttributes !== undefined) { this.htmlAttributes(ctx.htmlAttributes) }
    if (ctx.bodyAttributes !== undefined) { this.bodyAttributes(ctx.bodyAttributes) }

    return this
  }

  /**
   * Produce the final head context. The title template (if any) is applied to the title.
   *
   * @returns The resolved {@link HeadContext}.
   */
  toContext (): HeadContext {
    const result: HeadContext = { ...this.context }

    if (result.titleTemplate !== undefined && result.title !== undefined) {
      result.title = result.titleTemplate.replace('%s', result.title)
      delete result.titleTemplate
    }

    // Drop empty collections for a clean output.
    for (const key of ['metas', 'links', 'scripts', 'styles', 'jsonLd'] as const) {
      if (Array.isArray(result[key]) && result[key]?.length === 0) { result[key] = undefined }
    }

    return result
  }
}

/**
 * Create a new {@link HeadManager}.
 *
 * @param initial - An optional initial head context.
 * @returns A new HeadManager.
 */
export function createHead (initial: HeadContext = {}): HeadManager {
  return new HeadManager(initial)
}

/**
 * Imperative helper mirroring the builder: returns the head context as-is (identity),
 * for functional-first users who prefer a plain object with full typing.
 *
 * @param context - The head context.
 * @returns The same head context.
 */
export function defineHead (context: HeadContext): HeadContext {
  return context
}

/**
 * Compute the dedupe key for a meta descriptor.
 */
function metaKey (descriptor: Record<string, unknown>): string {
  if (typeof descriptor.charset === 'string') { return 'charset' }
  if (typeof descriptor.property === 'string') { return `property:${descriptor.property}` }
  if (typeof descriptor.name === 'string') { return `name:${descriptor.name}` }
  if (typeof descriptor['http-equiv'] === 'string') { return `http-equiv:${descriptor['http-equiv']}` }
  return JSON.stringify(descriptor)
}

/**
 * Best-effort deep clone that never throws on non-cloneable values.
 */
function structuredCloneSafe<T> (value: T): T {
  try {
    return structuredClone(value)
  } catch {
    return JSON.parse(JSON.stringify(value))
  }
}
