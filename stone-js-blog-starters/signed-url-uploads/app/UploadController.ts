import { EventHandler, Get, Post } from '@stone-js/router'
import { UploadRecord, UploadService } from './UploadService'
import { FileSystem, SignedUpload, SignedUrlCapable, supportsSignedUrls } from '@stone-js/filesystem'
import { BadRequestError, IncomingHttpEvent, JsonHttpResponse } from '@stone-js/http-core'

export interface UploadControllerOptions {
  fileSystem: FileSystem
  uploadService: UploadService
}

/**
 * UploadController
 *
 * The bytes never travel through the function. `/sign` hands the client a short-lived PUT target;
 * the client uploads straight to the bucket; `/complete` records only the metadata. `/{id}/url`
 * mints a short-lived read URL for a private download.
 */
@EventHandler('/uploads')
export class UploadController {
  private readonly fileSystem: FileSystem
  private readonly uploadService: UploadService

  constructor ({ fileSystem, uploadService }: UploadControllerOptions) {
    this.fileSystem = fileSystem
    this.uploadService = uploadService
  }

  /** Hand the client a short-lived, direct-to-storage upload target. */
  @Post('/sign')
  @JsonHttpResponse(200)
  async sign (event: IncomingHttpEvent): Promise<SignedUpload> {
    const fs = this.signedUrlDisk()
    const id = event.get<string>('id', 'file')
    return await fs.temporaryUploadUrl(this.keyFor(id), { contentType: 'image/png', expiresIn: 600 })
  }

  /** Record only the metadata once the client has uploaded the bytes. */
  @Post('/complete')
  @JsonHttpResponse(201)
  complete (event: IncomingHttpEvent): UploadRecord {
    const id = event.get<string>('id', 'file')
    return this.uploadService.record({ id, key: this.keyFor(id), contentType: 'image/png' })
  }

  /** Mint a short-lived read URL for a private download. */
  @Get('/:id/url')
  @JsonHttpResponse(200)
  async downloadUrl (event: IncomingHttpEvent): Promise<{ url: string }> {
    const fs = this.signedUrlDisk()
    const id = event.get<string>('id', 'file')
    return { url: await fs.temporaryUrl(this.keyFor(id), { expiresIn: 60 }) }
  }

  private keyFor (id: string): string {
    return `avatars/${id}.png`
  }

  /** Narrow the disk to a signed-URL-capable one, or reject: the local driver has none. */
  private signedUrlDisk (): FileSystem & SignedUrlCapable {
    if (!supportsSignedUrls(this.fileSystem)) {
      throw new BadRequestError('The configured disk does not support signed URLs.')
    }
    return this.fileSystem
  }
}
