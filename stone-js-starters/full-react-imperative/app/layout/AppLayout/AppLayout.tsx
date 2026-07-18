import './AppLayout.css'
import { JSX } from 'react'
import { LayoutHeader } from '../../components/LayoutHeader/LayoutHeader'
import { LayoutLeftMenu } from '../../components/LayoutLeftMenu/LayoutLeftMenu'
import { RightAsidePanel } from '../../components/RightAsidePanel/RightAsidePanel'
import { definePageLayout, IPageLayout, PageLayoutRenderContext, StoneOutlet } from '@stone-js/use-react'

/**
 * App Layout component.
 */
export const AppLayout = (): IPageLayout => ({
  /**
   * Render the component.
   *
   * @param options - The options for rendering the component.
   * @returns The rendered component.
   */
  render ({ container, children }: PageLayoutRenderContext): JSX.Element {
    return (
      <div className='app-layout'>
        <header className='app-header'>
          <LayoutHeader container={container} />
        </header>

        <div className='app-main'>
          <aside className='main-left'>
            <LayoutLeftMenu container={container} />
          </aside>
          <main className='main-center'>
            <StoneOutlet>{children}</StoneOutlet>
          </main>
          <aside className='main-right'>
            <RightAsidePanel container={container} />
          </aside>
        </div>

        <footer className='app-footer'>
          Stone.js &copy; 2025 Stone Foundation
        </footer>
      </div>
    )
  }
})

/**
 * App Layout blueprint.
 */
export const AppLayoutBlueprint = definePageLayout(AppLayout, { name: 'default' })
