import { JSX } from 'react'

/**
 * A single, static code block. Highlighting stays deliberately light for now
 * (brand monospace, a filename chip); a Shiki pass can enrich this later without
 * touching call sites.
 */
export function Code ({ children, file, lang = 'ts' }: { children: string, file?: string, lang?: string }): JSX.Element {
  return (
    <div className='doc-code'>
      {file !== undefined && <div className='code-bar'><span className='code-file'>{file}</span><span className='code-lang'>{lang}</span></div>}
      <pre><code>{children.replace(/^\n/, '').replace(/\n$/, '')}</code></pre>
    </div>
  )
}

/**
 * Paradigm-aware code. Both variants are rendered; the global paradigm switch
 * (an attribute on <html>) reveals exactly one via CSS. No hydration mismatch,
 * and the declarative default still shows with JavaScript disabled.
 */
export function CodeTabs ({ decl, imp, file }: { decl: string, imp: string, file?: string }): JSX.Element {
  return (
    <div className='doc-code codetabs'>
      {file !== undefined && (
        <div className='code-bar'>
          <span className='code-file'>{file}</span>
          <span className='code-para'>
            <span className='cp cp-decl'>declarative</span>
            <span className='cp cp-imp'>imperative</span>
          </span>
        </div>
      )}
      <div className='p-decl'><pre><code>{decl.replace(/^\n/, '').replace(/\n$/, '')}</code></pre></div>
      <div className='p-imp'><pre><code>{imp.replace(/^\n/, '').replace(/\n$/, '')}</code></pre></div>
    </div>
  )
}
