import { Routing } from '@stone-js/router'
import { CloudFile } from '@stone-js/cloud-file'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { NodeHttp } from '@stone-js/node-http-adapter'
import { StoneApp, LogLevel } from '@stone-js/core'

/**
 * Application
 *
 * @CloudFile enables cloud storage on the agnostic filesystem contract and injects the default disk
 * as `fileSystem`. The `s3` driver is S3-compatible: point `endpoint` at Cloudflare R2, MinIO,
 * DigitalOcean Spaces, etc. Credentials come from the standard AWS environment variables.
 */
@Routing()
@CloudFile({ driver: 's3', bucket: 'uploads', region: 'eu-west-3' })
@NodeConsole()
@NodeHttp({ default: true })
@StoneApp({ name: 'SignedUrlUploads', logger: { level: LogLevel.INFO } })
export class Application {}
