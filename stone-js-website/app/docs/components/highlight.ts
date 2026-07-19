import Prism from 'prismjs'
// Grammars, registered by side effect on the Prism singleton. Order matters:
// typescript extends javascript (core), jsx extends markup+javascript, tsx
// extends both, so tsx must come last.
import 'prismjs/components/prism-typescript.js'
import 'prismjs/components/prism-jsx.js'
import 'prismjs/components/prism-tsx.js'
import 'prismjs/components/prism-bash.js'
import 'prismjs/components/prism-json.js'

/** Friendly language aliases mapped to Prism grammar names. */
const ALIAS: Record<string, string> = {
  ts: 'tsx', // our TS snippets contain JSX, so tsx is the safe superset
  tsx: 'tsx',
  typescript: 'tsx',
  js: 'javascript',
  jsx: 'jsx',
  bash: 'bash',
  sh: 'bash',
  shell: 'bash',
  json: 'json'
}

function escapeHtml (input: string): string {
  return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Highlights a code string to Prism HTML. Runs identically on the server and in
 * the browser (deterministic, no async), so the SSG markup and the hydrated
 * markup match. Unknown languages (e.g. `text`) fall back to escaped plain code.
 */
export function highlight (code: string, lang = 'ts'): string {
  const name = ALIAS[lang]
  const grammar = name !== undefined ? Prism.languages[name] : undefined
  if (grammar === undefined) return escapeHtml(code)
  return Prism.highlight(code, grammar, name)
}
