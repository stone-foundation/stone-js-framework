/**
 * Ambient module declarations so component imports of static assets type-check.
 * The actual resolution is done by the CLI's Vite `resolve.alias` (see stone.config.mjs).
 */
declare module '*.png' {
  const src: string
  export default src
}
declare module '*.jpg' {
  const src: string
  export default src
}
declare module '*.svg' {
  const src: string
  export default src
}
declare module '*.webp' {
  const src: string
  export default src
}

// Asset alias namespaces (mirror stone.config.mjs `assets.aliases`).
declare module '@img/*' {
  const src: string
  export default src
}
declare module '@assets/*' {
  const src: string
  export default src
}
declare module '@css/*' {
  const href: string
  export default href
}
