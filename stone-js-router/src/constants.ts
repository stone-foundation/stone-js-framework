import { HttpMethod } from './declarations'

// HTTP Methods
export const GET: HttpMethod = 'GET'
export const PUT: HttpMethod = 'PUT'
export const HEAD: HttpMethod = 'HEAD'
export const POST: HttpMethod = 'POST'
export const PATCH: HttpMethod = 'PATCH'
export const DELETE: HttpMethod = 'DELETE'
export const OPTIONS: HttpMethod = 'OPTIONS'
export const HTTP_METHODS = [GET, PUT, HEAD, POST, PATCH, DELETE, OPTIONS]

// Node.js Console Platform name
export const NODE_CONSOLE_PLATFORM = 'node_console'

// Navigation event
export const NAVIGATION_EVENT = '@stonejs/router.navigate'

// Default maximum request URI length (characters) accepted before matching.
// Defence-in-depth against pathological inputs; overridable via `stone.router.maxUriLength`.
export const MAX_URI_LENGTH = 2048
