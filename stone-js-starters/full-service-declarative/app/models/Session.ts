/**
 * Session Interface
*/
export interface Session {
  ip: string
  id: number
  uuid: string
  userId: number
  createdAt: number
  expiresAt: number
  lastActivityAt: number
  closedAt?: number | null
  userAgent?: string | null
}
