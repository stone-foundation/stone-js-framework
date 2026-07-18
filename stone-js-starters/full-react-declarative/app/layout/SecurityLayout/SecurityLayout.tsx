import './SecurityLayout.css'
import { JSX } from 'react'
import { PageLayout, IPageLayout, PageLayoutRenderContext, StoneOutlet } from '@stone-js/use-react'

/**
 * Security Layout component.
 */
@PageLayout({ name: 'security' })
export class SecurityLayout implements IPageLayout {
  /**
   * Render the component.
   *
   * @param options - The options for rendering the component.
   * @returns The rendered component.
   */
  render ({ children }: PageLayoutRenderContext): JSX.Element {
    return (
      <>
        <header className='mt-64'>
          <div className='container'>
            <p className='pa-24'>
              <img src='/logo.png' className='logo' alt='Stone.js Logo' />
            </p>
          </div>
        </header>
        <main>
          <div className='container'>
            <StoneOutlet>{children}</StoneOutlet>
          </div>
        </main>
        <footer className='mt-24'>
          <div className='container'>
            <p className='px-24 text-muted'>2025 Stone.js &copy; Noowow Labs</p>
          </div>
        </footer>
      </>
    )
  }
}
