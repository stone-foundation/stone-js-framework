import { JSX, useState } from 'react'
import { highlight } from './highlight'

/** Trims a leading/trailing newline from a template-literal snippet. */
function clean (code: string): string {
  return code.replace(/^\n/, '').replace(/\n$/, '')
}

/** A copy-to-clipboard button that confirms briefly once the text is copied. */
function CopyButton ({ getText }: { getText: () => string }): JSX.Element {
  const [copied, setCopied] = useState(false)

  const copy = (): void => {
    const text = getText()
    const done = (): void => { setCopied(true); setTimeout(() => setCopied(false), 1600) }
    if (navigator.clipboard?.writeText !== undefined) {
      void navigator.clipboard.writeText(text).then(done, () => {})
    } else {
      // Fallback for non-secure contexts.
      const ta = document.createElement('textarea')
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'
      document.body.appendChild(ta); ta.select()
      try { document.execCommand('copy'); done() } catch {}
      document.body.removeChild(ta)
    }
  }

  return (
    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy} aria-label={copied ? 'Copied' : 'Copy code'}>
      {copied
        ? (<><svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.4'><path d='m5 13 4 4L19 7' /></svg>Copied</>)
        : (<><svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><rect x='9' y='9' width='11' height='11' rx='2' /><path d='M5 15V5a2 2 0 0 1 2-2h10' /></svg>Copy</>)}
    </button>
  )
}

/**
 * A single, static code block, syntax-highlighted with Prism (isomorphic, so the
 * SSG output already ships coloured, and hydration matches). Includes a copy button.
 */
export function Code ({ children, file, lang = 'ts' }: { children: string, file?: string, lang?: string }): JSX.Element {
  const code = clean(children)
  return (
    <div className='doc-code'>
      {file !== undefined
        ? <div className='code-bar'><span className='code-file'>{file}</span><span className='code-lang'>{lang}</span></div>
        : null}
      <div className='code-body'>
        <CopyButton getText={() => code} />
        <pre className={`language-${lang}`}><code dangerouslySetInnerHTML={{ __html: highlight(code, lang) }} /></pre>
      </div>
    </div>
  )
}

/**
 * Paradigm-aware code. Both variants are rendered and highlighted; the global
 * paradigm switch (an attribute on <html>) reveals exactly one via CSS. The copy
 * button copies whichever variant is currently shown.
 */
export function CodeTabs ({ decl, imp, file, lang = 'ts' }: { decl: string, imp: string, file?: string, lang?: string }): JSX.Element {
  const d = clean(decl)
  const i = clean(imp)
  const active = (): string => (typeof document !== 'undefined' && document.documentElement.getAttribute('data-paradigm') === 'imperative') ? i : d

  return (
    <div className='doc-code codetabs'>
      {file !== undefined
        ? (
          <div className='code-bar'>
            <span className='code-file'>{file}</span>
            <span className='code-para'>
              <span className='cp cp-decl'>declarative</span>
              <span className='cp cp-imp'>imperative</span>
            </span>
          </div>
          )
        : null}
      <div className='code-body'>
        <CopyButton getText={active} />
        <div className='p-decl'><pre className={`language-${lang}`}><code dangerouslySetInnerHTML={{ __html: highlight(d, lang) }} /></pre></div>
        <div className='p-imp'><pre className={`language-${lang}`}><code dangerouslySetInnerHTML={{ __html: highlight(i, lang) }} /></pre></div>
      </div>
    </div>
  )
}
