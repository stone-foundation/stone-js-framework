import { JSX } from 'react'
import { Reveal } from '../components/ui/Reveal'

/**
 * Two paradigms, one state: the same domain, declarative and imperative, shown
 * side by side. Both are first-class, 1:1, forever. The seam between them is
 * the same braise vein that crosses the strata: entangled, never divergent.
 */
export function Paradigms (): JSX.Element {
  return (
    <section id='paradigms'>
      <div className='wrap'>
        <Reveal className='sec-head center'>
          <p className='eyebrow'><span className='psi'>ψ</span>Two paradigms, one state</p>
          <h2>Decorators or define*. Superposed, until you choose.</h2>
          <p>
            Both paradigms are first-class and 1:1: same domain, same power. Pick one in the
            docs and every example follows you, classes only or functions only.
          </p>
        </Reveal>
        <Reveal>
          <div className='paradigms'>
            <div className='pcard'>
              <p className='plabel'>|declarative⟩ · classes</p>
              <pre>
                <span className='kw'>@EventHandler</span>(<span className='st'>'/tasks'</span>){'\n'}
                <span className='kw'>export class</span> <span className='fn'>TasksController</span> {'{\n'}
                {'  '}<span className='kw'>constructor</span> ({'{ tasks }'}) {'{ '}<span className='kw'>this</span>.tasks = tasks{' }\n\n'}
                {'  '}<span className='kw'>@Get</span>(<span className='st'>'/'</span>){'\n'}
                {'  '}<span className='fn'>list</span> () {'{ '}<span className='kw'>return this</span>.tasks.list(){' }\n'}
                {'}'}
              </pre>
            </div>
            <div className='pseam' aria-hidden='true'><span className='medal'>1:1</span></div>
            <div className='pcard'>
              <p className='plabel'>|imperative⟩ · functions</p>
              <pre>
                <span className='kw'>export const</span> Routes = <span className='fn'>defineRoutes</span>([{'\n'}
                {'  '}[({'{ tasks }'}) =&gt; () =&gt; tasks.list(),{'\n'}
                {'    '}{'{ path: '}<span className='st'>'/tasks'</span>, method: <span className='st'>'GET'</span>{' }],\n'}
                ]){'\n\n'}
                <span className='cm'>{'// same domain, same power'}</span>
              </pre>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
