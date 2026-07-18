import { AxiosResponse, AxiosRequestConfig } from 'axios'

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Axios Client contract
 */
export interface IAxiosClient {
  /**
   * Make a generic HTTP request.
   *
   * @param url - The URL to request.
   * @param payload - Optional request body.
   * @param options - Axios request configuration.
   * @returns The response data.
   * @throws UnauthorizedError
   * @throws AxiosError
   */
  request: <T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    payload?: D,
    options?: AxiosRequestConfig<D>
  ) => Promise<T>

  /**
   * Make a GET request.
   *
   * @param url - The URL to request.
   * @param options - Axios request configuration.
   * @returns The response data.
   */
  get: <T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    options?: AxiosRequestConfig<D>
  ) => Promise<T>

  /**
   * Make a POST request.
   *
   * @param url - The URL to request.
   * @param data - The data to send.
   * @param options - Axios request configuration.
   * @returns The response data.
   */
  post: <T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    options?: AxiosRequestConfig<D>
  ) => Promise<T>

  /**
   * Make a PUT request.
   *
   * @param url - The URL to request.
   * @param data - The data to send.
   * @param options - Axios request configuration.
   * @returns The response data.
   */
  put: <T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    options?: AxiosRequestConfig<D>
  ) => Promise<T>

  /**
   * Make a PATCH request.
   *
   * @param url - The URL to request.
   * @param data - The data to send.
   * @param options - Axios request configuration.
   * @returns The response data.
   */
  patch: <T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    options?: AxiosRequestConfig<D>
  ) => Promise<T>

  /**
   * Make a DELETE request.
   *
   * @param url - The URL to request.
   * @param options - Axios request configuration.
   * @returns The response data.
   */
  delete: <T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    options?: AxiosRequestConfig<D>
  ) => Promise<T>

  /**
   * Retrieves the access token.
   *
   * @returns The access token string.
   */
  getAccessToken: () => Promise<string>
}
