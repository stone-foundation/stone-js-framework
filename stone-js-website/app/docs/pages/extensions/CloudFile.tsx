import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extensions/cloud-file'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { CloudFile } from '@stone-js/cloud-file'

@CloudFile({ driver: 's3', bucket: 'uploads', region: 'eu-west-3' })
@StoneApp({ name: 'app' })
export class Application {}
`

const IMP = `
import { defineConfig } from '@stone-js/core'

export const AppConfig = defineConfig({
  filesystem: {
    default: 's3',
    disks: [
      { name: 's3', driver: 's3', bucket: 'uploads', region: 'eu-west-3' },
      { name: 'r2', driver: 's3', bucket: 'assets', endpoint: 'https://<acct>.r2.cloudflarestorage.com' }
    ]
  }
})
`

/**
 * Extensions: Cloud File (storage).
 */
@Page(PATH, { layout: 'docs' })
export class CloudFile implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Cloud File',
      description: 'Cloud storage on the agnostic filesystem contract: S3 and S3-compatible drivers, injected as fileSystem, with signed URLs for direct-to-cloud uploads.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='Cloud File' />
        <Lead>
          Your domain talks to one agnostic storage contract, never to a cloud SDK.
          <code> @stone-js/cloud-file</code> supplies the cloud drivers (S3 and every S3-compatible
          store: R2, MinIO, Spaces, OSS, COS) and wires them into the container, so switching or mixing
          backends is configuration, not code. GCS and Azure Blob follow.
        </Lead>

        <H2>Install</H2>
        <p>The provider SDK is never bundled: install the module, then the SDK for the store you use.</p>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/cloud-file
npm i @aws-sdk/client-s3 @aws-sdk/s3-request-presigner   # S3 / R2 / MinIO / Spaces / OSS / COS`}</Code>

        <H2>Enable it</H2>
        <Principle
          principle={
            <p>
              Code that depends on a concrete backend is welded to it. Depend on the capability, a
              file store, and the backend becomes a deployment choice.
            </p>
          }
          incarnation={
            <p>
              Every driver implements the same <code>FileSystem</code> contract from
              <code> @stone-js/filesystem</code>. The provider registers them lazily (the SDK is only
              constructed when a disk is first used) and injects the default disk as
              <code> fileSystem</code>.
            </p>
          }
        />
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H3>Inject the store</H3>
        <p>
          The default disk is injected as <code>fileSystem</code>; the multi-disk manager as
          <code> storage</code>.
        </p>
        <Code file='app/UploadService.ts'>{`export class UploadService {
  constructor (private readonly fileSystem) {}          // the default disk

  async save (path, bytes) {
    await this.fileSystem.put(path, bytes)              // same API on local, S3, R2, ...
    return await this.fileSystem.url(path)
  }
}`}</Code>

        <H2>Signed URLs: upload straight to the cloud</H2>
        <p>
          Large files should not travel through your function. Issue a short-lived signed URL and let
          the client <code>PUT</code> the bytes straight to the bucket; your handler only ever sees
          metadata.
        </p>
        <Code file='app/UploadController.ts'>{`import { EventHandler, Post } from '@stone-js/router'

@EventHandler('/uploads')
export class UploadController {
  constructor (private readonly fileSystem) {}

  @Post('/sign')
  async sign (event) {
    // hand the client a short-lived PUT target
    return await this.fileSystem.temporaryUploadUrl(\`avatars/\${event.get('id')}.png\`, {
      contentType: 'image/png',
      expiresIn: 600
    })
  }
}`}</Code>
        <p>
          For a private download, mint a temporary read URL: <code>fileSystem.temporaryUrl(path, {'{'} expiresIn: 60 {'}'})</code>.
          Feature-detect with <code>supportsSignedUrls(disk)</code> from <code>@stone-js/filesystem</code>
          before calling, since the local driver has no signed URLs.
        </p>

        <H2>Drivers</H2>
        <PropsTable nameHeader='driver' rows={[
          { name: 's3', type: 'ships now', desc: 'Amazon S3 + S3-compatible: Cloudflare R2, MinIO (forcePathStyle), DigitalOcean Spaces, Alibaba OSS, Tencent COS (set endpoint).' },
          { name: 'local', type: 'built-in', desc: 'From @stone-js/filesystem; the default disk. No signed URLs.' },
          { name: 'gcs / azure', type: 'coming next', desc: 'Google Cloud Storage and Azure Blob, same contract.' }
        ]} />

        <Callout kind='note' title='S3-compatible in one line'>
          Point the S3 driver at any S3-compatible endpoint with <code>endpoint</code> (and
          <code> forcePathStyle: true</code> for MinIO). Everything else is identical, so one driver
          covers most of the market.
        </Callout>

        <SeeAlso links={[
          { title: 'Filesystem & storage', path: '/docs/essentials/filesystem' },
          { title: 'Service container & DI', path: '/docs/foundations/container' },
          { title: 'Service providers', path: '/docs/foundations/providers' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
