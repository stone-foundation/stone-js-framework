import { NotFoundError } from '@stone-js/http-core'
import { PostService } from '../app/services/PostService'
import { PostRepository } from '../app/repositories/PostRepository'
import { Post } from '../app/models/Post'

// Neutralize the @Service decorator to lighten the test environment,
// while keeping the real `isNotEmpty` helper so we assert real behavior.
vi.mock(import('@stone-js/core'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    Service: vi.fn(() => vi.fn()),
  }
})

describe('PostService', () => {
  let service: PostService
  let postRepository: PostRepository

  beforeEach(() => {
    postRepository = {
      list: vi.fn(),
      findById: vi.fn(),
    } as unknown as PostRepository

    service = new PostService({ postRepository })
  })

  it('should delegate list() to the repository with the given limit', async () => {
    // Arrange
    const posts = [{ id: 1, title: 'Hello' }] as unknown as Post[]
    ;(postRepository.list as any).mockResolvedValue(posts)

    // Act
    const result = await service.list(5)

    // Assert
    expect(result).toBe(posts)
    expect(postRepository.list).toHaveBeenCalledWith({ limit: 5 })
  })

  it('should return the post when found and throw NotFoundError otherwise', async () => {
    // Arrange
    const post = { id: 42, title: 'Answer' } as unknown as Post
    ;(postRepository.findById as any).mockResolvedValueOnce(post)

    // Act & Assert (found)
    await expect(service.findById(42)).resolves.toBe(post)

    // Arrange (not found)
    ;(postRepository.findById as any).mockResolvedValueOnce(undefined)

    // Act & Assert (not found)
    await expect(service.findById(99)).rejects.toBeInstanceOf(NotFoundError)
  })
})
