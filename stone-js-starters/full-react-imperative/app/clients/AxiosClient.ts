import { isEmpty, isNotEmpty } from '@stone-js/core'
import { IAxiosClient } from './contracts/IAxiosClient'
import { UnauthorizedError } from '../errors/UnauthorizedError'
import { isServer, ReactIncomingEvent } from '@stone-js/use-react'
import { ITokenService } from '../services/contracts/ITokenService'
import { AxiosError, Axios, AxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * Axios Client Options
 */
export interface AxiosClientOptions {
  axios: Axios
  event: ReactIncomingEvent
  tokenService: ITokenService
}

/**
 * Axios Client
 */
export const AxiosClient = ({ axios, event, tokenService }: AxiosClientOptions): IAxiosClient => {
  return {
    /**
     * Make a request
     *
     * @param url - The URL to request
     * @param data - The data to send
     * @param options - The request options
     * @returns The response data
     * @throws NotAuthenticateError
     * @throws AxiosError
     */
    async request<T = any, R = AxiosResponse<T>, D = any>(url: string, payload?: D, options?: AxiosRequestConfig<D>): Promise<T> {
      try {
        const token = await this.getAccessToken()
        const headers: Record<string, any> = options?.headers ?? {}
        // const validateStatus = (status: number) => status >= 200 && status < 500

        if (isServer()) { headers['User-Agent'] = event.userAgent }

        headers.Accept ??= 'application/json'
        headers['Content-Type'] ??= 'application/json'
        headers.Authorization = isEmpty(token) ? '' : `Bearer ${token}`

        return (await axios.request({ ...options, url, data: payload, headers /* validateStatus */ })).data
      } catch (error: any) {
        if (isNotEmpty<AxiosError<R, D>>(error) && error.status === 401) {
          throw new UnauthorizedError(error.message, { cause: error })
        } else {
          throw error
        }
      }
    },

    /**
     * Make a GET request
     *
     * @param url - The URL to request
     * @param options - The request options
     * @returns The response data
     */
    async get<T = any, R = AxiosResponse<T>, D = any>(url: string, options?: AxiosRequestConfig<D>): Promise<T> {
      return await this.request<T, R, D>(url, undefined, { ...options, method: 'GET' })
    },

    /**
     * Make a POST request
     *
     * @param url - The URL to request
     * @param data - The data to send
     * @param options - The request options
     * @returns The response data
     */
    async post<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, options?: AxiosRequestConfig<D>): Promise<T> {
      return await this.request<T, R, D>(url, data, { ...options, method: 'POST' })
    },

    /**
     * Make a PUT request
     *
     * @param url - The URL to request
     * @param data - The data to send
     * @param options - The request options
     * @returns The response data
     */
    async put<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, options?: AxiosRequestConfig<D>): Promise<T> {
      return await this.request<T, R, D>(url, data, { ...options, method: 'PUT' })
    },

    /**
     * Make a PATCH request
     *
     * @param url - The URL to request
     * @param data - The data to send
     * @param options - The request options
     * @returns The response data
     */
    async patch<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, options?: AxiosRequestConfig<D>): Promise<T> {
      return await this.request<T, R, D>(url, data, { ...options, method: 'PATCH' })
    },

    /**
     * Make a DELETE request
     *
     * @param url - The URL to request
     * @param options - The request options
     * @returns The response data
     */
    async delete<T = any, R = AxiosResponse<T>, D = any>(url: string, options?: AxiosRequestConfig<D>): Promise<T> {
      return await this.request<T, R, D>(url, undefined, { ...options, method: 'DELETE' })
    },

    /**
     * Get the access token
     *
     * @returns The access token
     */
    async getAccessToken (): Promise<string> {
      if (isNotEmpty(tokenService.getAccessToken()) && !tokenService.isAuthenticated()) {
        await tokenService.refresh()
      }
      return tokenService.getAccessToken() ?? ''
    }
  }
}
