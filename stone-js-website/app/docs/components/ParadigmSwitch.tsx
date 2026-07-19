import { JSX, useEffect, useState } from 'react'

type Paradigm = 'declarative' | 'imperative'

/** Reads the persisted paradigm; declarative is the default. */
function readParadigm (): Paradigm {
  try {
    return localStorage.getItem('stone-paradigm') === 'imperative' ? 'imperative' : 'declarative'
  } catch { return 'declarative' }
}

/**
 * The global paradigm switch. It flips a `data-paradigm` attribute on <html>;
 * CSS then reveals the matching code across every page. The choice persists and
 * is restored before paint by the no-flash script in the docs layout head.
 */
export function ParadigmSwitch (): JSX.Element {
  const [paradigm, setParadigm] = useState<Paradigm>('declarative')

  // On mount, adopt the persisted choice and mirror it onto <html> so the CSS
  // reveals the right code even on a fresh navigation.
  useEffect(() => {
    const saved = readParadigm()
    setParadigm(saved)
    document.documentElement.setAttribute('data-paradigm', saved)
  }, [])

  const choose = (next: Paradigm): void => {
    setParadigm(next)
    document.documentElement.setAttribute('data-paradigm', next)
    try { localStorage.setItem('stone-paradigm', next) } catch {}
  }

  return (
    <div className='paradigm-switch' role='group' aria-label='Code paradigm'>
      <span className='ps-label'>Paradigm</span>
      <div className='ps-track'>
        <button className='ps-btn' aria-pressed={paradigm === 'declarative'} onClick={() => choose('declarative')}>Decorators</button>
        <button className='ps-btn' aria-pressed={paradigm === 'imperative'} onClick={() => choose('imperative')}>define*</button>
      </div>
    </div>
  )
}
