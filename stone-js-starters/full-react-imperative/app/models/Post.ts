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
  imagePath?: string
  likesCount: number
  sharesCount: number
  commentsCount: number
  likedByCurrentUser: boolean
}

/**
 * New Post Interface
*/
export interface PostInput {
  title: string
  content: string
}
