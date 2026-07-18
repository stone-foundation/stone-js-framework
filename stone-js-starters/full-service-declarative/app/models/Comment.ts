import { User } from './User'

/**
 * Comment Interface
*/
export interface CommentModel {
  id: number
  content: string
  postId: number
  authorId: number
  createdAt: number
}

/**
 * Comment Create Model Interface
*/
export interface CommentCreateModel extends Omit<CommentModel, 'id'> {}

/**
 * Comment Interface
*/
export interface Comment extends Omit<CommentModel, 'authorId'> {
  author: User
}

/**
 * Comment Create Request Interface
 * Represents a comment create request resource.
*/
export interface CommentCreateRequest {
  content: string
}

/**
 * Comment Response Interface
 * Represents a comment response resource.
*/
export interface CommentResponse extends Comment {}
