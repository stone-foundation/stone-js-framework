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

/** A highlighted block with an aligned line-number gutter. */
function Block ({ code, lang }: { code: string, lang: string }): JSX.Element {
  const count = code.split('\n').length
  return (
    <div className='code-scroll'>
      <span className='code-gutter' aria-hidden='true'>
        {Array.from({ length: count }, (_, i) => <span key={i}>{i + 1}</span>)}
      </span>
      <pre className={`language-${lang}`}><code dangerouslySetInnerHTML={{ __html: highlight(code, lang) }} /></pre>
    </div>
  )
}

/**
 * A single, static code block: Prism-highlighted (isomorphic), with line numbers
 * and a copy button.
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
        <Block code={code} lang={lang} />
      </div>
    </div>
  )
}

/**
 * Paradigm-aware code. Both variants are rendered (line-numbered); the global
 * paradigm switch reveals exactly one via CSS. The copy button copies the shown one.
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
        <div className='p-decl'><Block code={d} lang={lang} /></div>
        <div className='p-imp'><Block code={i} lang={lang} /></div>
      </div>
    </div>
  )
}

/** One file inside a CodeGroup: a single `code`, or paradigm `decl`/`imp` variants. */
export interface CodeFile {
  name: string
  lang?: string
  code?: string
  decl?: string
  imp?: string
}

/** The visible code of a file, honouring the current paradigm. */
function fileText (f: CodeFile): string {
  if (f.code !== undefined) return clean(f.code)
  const imperative = typeof document !== 'undefined' && document.documentElement.getAttribute('data-paradigm') === 'imperative'
  return clean((imperative ? f.imp : f.decl) ?? f.decl ?? f.imp ?? '')
}

/**
 * Renders a file's body. Paradigm parity is 1:1: a file toggles between
 * declarative and imperative only when it carries BOTH. A file with a single
 * variant (or an explicit `code`) is common to both paradigms and stays visible
 * whichever is selected, so nothing ever blanks out or shows the wrong paradigm.
 */
function FileBody ({ f }: { f: CodeFile }): JSX.Element {
  const lang = f.lang ?? 'ts'
  if (f.code !== undefined) return <Block code={clean(f.code)} lang={lang} />
  if (f.decl !== undefined && f.imp !== undefined) {
    return (
      <>
        <div className='p-decl'><Block code={clean(f.decl)} lang={lang} /></div>
        <div className='p-imp'><Block code={clean(f.imp)} lang={lang} /></div>
      </>
    )
  }
  return <Block code={clean(f.decl ?? f.imp ?? '')} lang={lang} />
}

/**
 * A multi-file code snippet with a tab per file (the file name is the tab title).
 * Split an example across the files it really spans, e.g. the service in one tab
 * and the handler in another. Each file can still carry declarative/imperative
 * variants, toggled by the global paradigm switch. Line-numbered, with copy.
 */
export function CodeGroup ({ files }: { files: CodeFile[] }): JSX.Element {
  const [active, setActive] = useState(0)
  const current = files[active] ?? files[0]

  return (
    <div className='doc-code codegroup'>
      <div className='code-tabs' role='tablist'>
        {files.map((f, i) => (
          <button
            key={f.name}
            role='tab'
            aria-selected={i === active}
            className={`code-tab ${i === active ? 'active' : ''}`}
            onClick={() => setActive(i)}
          >
            {f.name}
          </button>
        ))}
        {files.some((f) => f.decl !== undefined && f.imp !== undefined) && (
          <span className='code-para'>
            <span className='cp cp-decl'>declarative</span>
            <span className='cp cp-imp'>imperative</span>
          </span>
        )}
      </div>
      <div className='code-body'>
        <CopyButton getText={() => fileText(current)} />
        {files.map((f, i) => (
          <div key={f.name} style={{ display: i === active ? undefined : 'none' }}>
            <FileBody f={f} />
          </div>
        ))}
      </div>
    </div>
  )
}
