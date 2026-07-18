import { User } from './User'

/**
 * Post Interface
*/
export interface Post {
  id: number
  author: User
  title: string
  content: string
  authorId: number
  createdAt: number
  updatedAt: number
}

/**
 * New Post Interface
*/
export interface PostInput {
  title: string
  content: string
}
