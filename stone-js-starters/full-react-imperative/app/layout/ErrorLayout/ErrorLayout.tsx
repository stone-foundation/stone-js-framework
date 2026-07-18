import './ErrorLayout.css'
import { JSX } from 'react'
import { IPageLayout, StoneOutlet, PageLayoutRenderContext, definePageLayout } from '@stone-js/use-react'

/**
 * Error Page Layout.
 */
export const ErrorLayout = (): IPageLayout => ({
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
            <div className='panel'>
              <StoneOutlet>{children}</StoneOutlet>
            </div>
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
})

/**
 * Error Page Layout Blueprint.
 */
export const ErrorLayoutBlueprint = definePageLayout(ErrorLayout, { name: 'error' })
