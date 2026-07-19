import { JSX } from 'react'
import { highlight } from './highlight'

/** Trims a leading/trailing newline from a template-literal snippet. */
function clean (code: string): string {
  return code.replace(/^\n/, '').replace(/\n$/, '')
}

/**
 * A single, static code block, syntax-highlighted with Prism (isomorphic, so the
 * SSG output already ships coloured, and hydration matches).
 */
export function Code ({ children, file, lang = 'ts' }: { children: string, file?: string, lang?: string }): JSX.Element {
  return (
    <div className='doc-code'>
      {file !== undefined && <div className='code-bar'><span className='code-file'>{file}</span><span className='code-lang'>{lang}</span></div>}
      <pre className={`language-${lang}`}><code dangerouslySetInnerHTML={{ __html: highlight(clean(children), lang) }} /></pre>
    </div>
  )
}

/**
 * Paradigm-aware code. Both variants are rendered and highlighted; the global
 * paradigm switch (an attribute on <html>) reveals exactly one via CSS. No
 * hydration mismatch, and the declarative default still shows without JavaScript.
 */
export function CodeTabs ({ decl, imp, file, lang = 'ts' }: { decl: string, imp: string, file?: string, lang?: string }): JSX.Element {
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
      <div className='p-decl'><pre className={`language-${lang}`}><code dangerouslySetInnerHTML={{ __html: highlight(clean(decl), lang) }} /></pre></div>
      <div className='p-imp'><pre className={`language-${lang}`}><code dangerouslySetInnerHTML={{ __html: highlight(clean(imp), lang) }} /></pre></div>
    </div>
  )
}
