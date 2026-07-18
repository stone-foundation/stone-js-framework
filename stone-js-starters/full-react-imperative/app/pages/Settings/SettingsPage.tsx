import { JSX } from 'react'
import { SettingsForm } from '../../components/SettingsForm/SettingsForm'
import { IPage, ReactIncomingEvent, definePage } from '@stone-js/use-react'

/**
 * SettingsPage component.
 */
export const SettingsPage = (): IPage<ReactIncomingEvent> => ({
  /**
   * Render the component.
   *
   * @param options - The options for rendering the component.
   * @returns The rendered component.
   */
  render (): JSX.Element {
    return <SettingsForm />
  }
})

/**
 * SettingsPage Blueprint.
 */
export const SettingsPageBlueprint = definePage(SettingsPage, { path: '/settings', layout: 'settings' })
