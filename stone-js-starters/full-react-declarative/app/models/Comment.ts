import { User } from './User'

/**
 * Comment Interface
*/
export interface Comment {
  id: number
  author: User
  content: string
  authorId: number
  postId: number
  createdAt: number
}

/**
 * New Comment Interface
*/
export interface CommentInput {
  id: number
  content: string
  postId: number
}

/**
 * Comment View Interface
*/
export interface CommentView extends CommentInput {
  author: User
  createdAt: number
  status?: 'idle' | 'saving' | 'error'
}
