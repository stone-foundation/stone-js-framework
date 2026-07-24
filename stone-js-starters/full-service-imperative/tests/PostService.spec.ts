import { NotFoundError } from '@stone-js/http-core'
import { factoryPostService } from '../app/services/PostService'
import { IPostService } from '../app/services/contracts/IPostService'
import { IPostRepository } from '../app/repositories/contracts/IPostRepository'
import { Post } from '../app/models/Post'

describe('factoryPostService', () => {
  let service: IPostService
  let postRepository: IPostRepository

  beforeEach(() => {
    postRepository = {
      list: vi.fn(),
      findById: vi.fn(),
    } as unknown as IPostRepository

    service = factoryPostService({ postRepository })
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
