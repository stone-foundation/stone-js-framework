import { defineBuilderConfig } from '@stone-js/cli'

/**
 * Build configuration for the showcase.
 *
 * - `target: 'react'` + `rendering: 'ssr'` exercises the server-rendered head pipeline.
 * - `assets` enables the `@img` / `@css` / `@assets` import aliases used in components.
 */
export default defineBuilderConfig({
  target: 'react',
  rendering: 'ssr',
  assets: {
    dir: 'assets',
    aliases: {
      '@assets': '',
      '@img': 'images',
      '@css': 'css'
    }
  }
})
