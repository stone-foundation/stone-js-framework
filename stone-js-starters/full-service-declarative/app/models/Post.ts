import { User } from './User'

/**
 * Post Model Interface
*/
export interface PostModel {
  id: number
  title: string
  content: string
  authorId: number
  createdAt: number
  updatedAt: number
}

/**
 * Post Create Model Interface
*/
export interface PostCreateModel extends Omit<PostModel, 'id'> {}

/**
 * Post Interface
*/
export interface Post extends Omit<PostModel, 'authorId'> {
  author: User
}

/**
 * Post Create Request Interface
 * Represents a post create request resource.
*/
export interface PostCreateRequest {
  title: string
  content: string
}

/**
 * Post Update Request Interface
 * Represents a post update request resource.
*/
export interface PostUpdateRequest {
  id: number
  title: string
  content: string
}

/**
 * Post Response Interface
 * Represents a post response resource.
*/
export interface PostResponse extends Post {}
