import { isEmpty, isNotEmpty } from '@stone-js/core'
import { TokenService } from '../services/TokenService'
import { UnauthorizedError } from '../errors/UnauthorizedError'
import { isServer, ReactIncomingEvent } from '@stone-js/use-react'
import { AxiosError, Axios, AxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * Axios Client Options
 */
export interface AxiosClientOptions {
  axios: Axios
  event: ReactIncomingEvent
  tokenService: TokenService
}

/**
 * Axios Client
 */
export class AxiosClient {
  private readonly axios: Axios
  private readonly event: ReactIncomingEvent
  private readonly tokenService: TokenService

  /**
   * Create a new Axios Client
   *
   * @param options - The options to create the Axios Client.
   */
  constructor ({ axios, event, tokenService }: AxiosClientOptions) {
    this.axios = axios
    this.event = event
    this.tokenService = tokenService
  }

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
      const headers: any = ((options?.headers) != null) || {}
      const token = await this.getAccessToken()
      // const validateStatus = (status: number) => status >= 200 && status < 500

      if (isServer()) { headers['User-Agent'] = this.event.userAgent }

      headers.Accept ??= 'application/json'
      headers['Content-Type'] ??= 'application/json'
      headers.Authorization = isEmpty(token) ? '' : `Bearer ${token}`

      return (await this.axios.request({ ...options, url, data: payload, headers /* validateStatus */ })).data
    } catch (error: any) {
      if (isNotEmpty<AxiosError<R, D>>(error) && error.status === 401) {
        throw new UnauthorizedError(error.message, { cause: error })
      } else {
        throw error
      }
    }
  }

  /**
   * Make a GET request
   *
   * @param url - The URL to request
   * @param options - The request options
   * @returns The response data
   */
  async get<T = any, R = AxiosResponse<T>, D = any>(url: string, options?: AxiosRequestConfig<D>): Promise<T> {
    return await this.request<T, R, D>(url, undefined, { ...options, method: 'GET' })
  }

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
  }

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
  }

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
  }

  /**
   * Make a DELETE request
   *
   * @param url - The URL to request
   * @param options - The request options
   * @returns The response data
   */
  async delete<T = any, R = AxiosResponse<T>, D = any>(url: string, options?: AxiosRequestConfig<D>): Promise<T> {
    return await this.request<T, R, D>(url, undefined, { ...options, method: 'DELETE' })
  }

  /**
   * Get the access token
   *
   * @returns The access token
   */
  private async getAccessToken (): Promise<string> {
    if (isNotEmpty(this.tokenService.getAccessToken()) && !this.tokenService.isAuthenticated()) {
      await this.tokenService.refresh()
    }
    return this.tokenService.getAccessToken() ?? ''
  }
}
