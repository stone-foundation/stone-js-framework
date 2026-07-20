import { join } from 'node:path'
import { File } from '@stone-js/filesystem'
import { IncomingHttpEvent } from '../IncomingHttpEvent'
import { BinaryFileResponse } from '../BinaryFileResponse'
import { OutgoingHttpResponse } from '../OutgoingHttpResponse'
import { IBlueprint, ILogger, NextMiddleware, type MetaMiddleware } from '@stone-js/core'

/**
 * Kernel Middleware for serving static files from a directory.
 * If a static file is found, it serves the file; otherwise, the request is passed to the next middleware.
 */
export class StaticFileMiddleware {
  private readonly logger: ILogger
  private readonly rootDir: string
  private readonly blueprint: IBlueprint

  /**
   * Create a new StaticFileMiddleware instance.
   *
   * @param container - The service container to inject dependencies.
   */
  constructor ({ blueprint, logger }: { blueprint: IBlueprint, logger: ILogger }) {
    this.logger = logger
    this.blueprint = blueprint
    this.rootDir = blueprint.get('stone.http.files.rootDir', process.cwd())
  }

  /**
   * Handle incoming HTTP events and serve static files if applicable.
   *
   * @param event - The incoming HTTP event.
   * @param next - The next middleware in the pipeline.
   * @returns The outgoing HTTP response.
   * @throws {ForbiddenError|InternalServerError} If access to the file is forbidden.
   */
  async handle (event: IncomingHttpEvent, next: NextMiddleware<IncomingHttpEvent, OutgoingHttpResponse>): Promise<OutgoingHttpResponse> {
    try {
      const file = this.makeFile(event)

      if (file.exists() && !file.isDir()) {
        this.logger.info(`Serving file: ${file.getPath()}`)
        return this.serveFile(file)
      }
    } catch (error: any) {
      // Ignore errors and pass the request to the next middleware
      this.logger.error(`Error handling file request: ${String(error.message)}`, { event })
    }

    const response = await next(event)

    response.isNotFound() && this.logger.info(`No static file found for path: ${event.pathname}`)

    return response
  }

  /**
   * Serve a static file.
   */
  private serveFile (file: File): BinaryFileResponse {
    return BinaryFileResponse.file({ file, autoEtag: true, autoLastModified: true, autoEncoding: true })
  }

  /**
   * Determine the file to serve, prioritizing compressed versions if supported by the client.
   *
   * @param event - The incoming HTTP event.
   * @returns The file to serve.
   */
  private makeFile (event: IncomingHttpEvent): File {
    const filePath = join(this.rootDir, event.pathname)
    const file = File.create(filePath, false)
    const encoding = this.blueprint.get<Record<string, string>>(
      'stone.http.files.defaultCompressionEncoding',
      { '.br': 'br', '.brotli': 'br', '.gzip': 'gzip', '.gz': 'gz' }
    )

    // Ensure the file is within the root directory
    if (!file.isPathPrefix(this.rootDir)) {
      return File.create('', false)
    }

    // Check for pre-compressed versions of the file
    for (const [ext, value] of Object.entries(encoding)) {
      if (event.getHeader('accept-encoding', '').includes(value)) {
        const compressedFile = File.create(`${filePath}${ext}`, false)
        if (compressedFile.exists()) { return compressedFile }
      }
    }

    // Default to the uncompressed file
    return file
  }
}

/**
 * Meta Middleware for serving static files from a directory.
 */
export const MetaStaticFileMiddleware: MetaMiddleware = { module: StaticFileMiddleware, isClass: true, global: true }
