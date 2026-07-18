import axios, { AxiosInstance } from 'axios'
import { AxiosClient } from '../clients/AxiosClient'
import { defineServiceProvider, IBlueprint, IContainer, IServiceProvider } from '@stone-js/core'

/**
 * Get Axios instance
 *
 * @param container - The container
 * @returns The Axios instance
 */
export function getAxiosInstance (container: IContainer): AxiosInstance {
  const baseURL = container.make<IBlueprint>('blueprint').get<string>('app.api.baseURL', 'http://localhost:8080')
  return axios.create({ baseURL })
}

/**
 * App Service Provider
 */
export const AppServiceProvider = (container: IContainer): IServiceProvider => ({
  /**
   * Register services to the container
   */
  register (): void {
    container
      .instanceIf('axios', getAxiosInstance(container))
      .singletonIf(AxiosClient, (container) => {
        return AxiosClient({
          axios: container.make('axios'),
          event: container.make('event'),
          tokenService: container.make('tokenService')
        })
      })
      .alias(AxiosClient, ['axiosClient', 'httpClient'])
  }
})

/**
 * App Service Provider Blueprint
 */
export const AppServiceProviderBlueprint = defineServiceProvider(AppServiceProvider)
