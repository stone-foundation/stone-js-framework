import { JSX } from 'react'

export type Paradigm = 'declarative' | 'imperative'

/** Reads the persisted paradigm; declarative is the default. */
export function readParadigm (): Paradigm {
  try {
    return localStorage.getItem('stone-paradigm') === 'imperative' ? 'imperative' : 'declarative'
  } catch { return 'declarative' }
}

/**
 * The paradigm switch. Controlled by the docs shell so a single source of truth
 * drives every instance (the header bar and the mobile overflow menu stay in
 * sync). It flips `data-paradigm` on <html>; CSS then reveals the matching code
 * on every page, and the choice persists across navigations.
 */
export function ParadigmSwitch ({ value, onChange }: { value: Paradigm, onChange: (p: Paradigm) => void }): JSX.Element {
  return (
    <div className='paradigm-switch' role='group' aria-label='Code paradigm'>
      <span className='ps-label'>Paradigm</span>
      <div className='ps-track'>
        <button className='ps-btn' aria-pressed={value === 'declarative'} onClick={() => onChange('declarative')}>Decorators</button>
        <button className='ps-btn' aria-pressed={value === 'imperative'} onClick={() => onChange('imperative')}>define*</button>
      </div>
    </div>
  )
}
