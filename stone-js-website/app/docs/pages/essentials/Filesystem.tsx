import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/essentials/filesystem'

/**
 * Essentials: filesystem & storage.
 */
@Page(PATH, { layout: 'docs' })
export class Filesystem implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Filesystem & storage',
      description: 'Read and write files through a storage abstraction, handle uploads, and resolve project paths, without hard-coding the platform’s file layout.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Essentials' title='Filesystem & storage' />
        <Lead>
          <code>@stone-js/filesystem</code> gives file access the same treatment as everything else: an
          abstraction you code against, not a platform's raw <code>fs</code>. You get a storage manager
          with named disks, typed uploaded files, and helpers that resolve project paths so nothing
          hard-codes a directory layout.
        </Lead>

        <H2>Storage disks</H2>
        <p>
          A <code>StorageManager</code> exposes named disks; each disk (like <code>LocalFileSystem</code>)
          implements the same contract. Code against the disk, and swap the driver, local, cloud,
          in-memory, without touching call sites.
        </p>
        <Code file='app/Reports.ts'>{`constructor ({ storage }) { this.disk = storage.disk('local') }

async save (name: string, contents: string) {
  await this.disk.put(\`reports/\${name}\`, contents)
}

async load (name: string) {
  if (!(await this.disk.exists(\`reports/\${name}\`))) return undefined
  return this.disk.get(\`reports/\${name}\`)
}`}</Code>

        <H3>The disk contract</H3>
        <PropsTable nameHeader='Method' rows={[
          { name: 'get(path)', type: '(path) => contents', desc: 'Read a file.' },
          { name: 'put(path, contents)', type: '(path, data) => void', desc: 'Write a file.' },
          { name: 'exists(path)', type: '(path) => boolean', desc: 'Whether a file exists.' },
          { name: 'delete(path)', type: '(path) => void', desc: 'Remove a file.' },
          { name: 'copy / move(from, to)', type: '(from, to) => void', desc: 'Copy or move a file.' },
          { name: 'files(dir)', type: '(dir) => string[]', desc: 'List files in a directory.' },
          { name: 'url(path)', type: '(path) => string', desc: 'A URL for a stored file, where the driver supports it.' }
        ]} />

        <H2>Uploaded files</H2>
        <p>
          A multipart upload arrives as an <code>UploadedFile</code>, read off the event, which you can
          inspect and store through a disk. This is the file side of the incoming event.
        </p>
        <Code file='app/Uploads.ts'>{`@Post('/import')
async import (event: IncomingHttpEvent) {
  const file = event.getFile('csv')            // an UploadedFile
  await this.storage.disk('local').put(\`imports/\${file.getClientOriginalName()}\`, file.getContent())
  return { imported: true }
}`}</Code>

        <H2>Path helpers</H2>
        <p>
          Resolve project locations without assembling paths by hand. Each helper joins its arguments
          onto a well-known root, so code stays correct wherever the app is built or run.
        </p>
        <PropsTable nameHeader='Helper' rows={[
          { name: 'basePath(...p)', type: '(...string) => string', desc: 'From the project root.' },
          { name: 'appPath(...p)', type: '(...string) => string', desc: 'From the app/ directory.' },
          { name: 'distPath(...p)', type: '(...string) => string', desc: 'From the build output.' },
          { name: 'buildPath(...p)', type: '(...string) => string', desc: 'From the build working directory.' },
          { name: 'tmpPath(...p)', type: '(...string) => string', desc: 'From a temp directory.' },
          { name: 'getFileHash(path)', type: '(path) => string', desc: 'A content hash for a file.' },
          { name: 'importModule(path)', type: '(path) => Promise<mod>', desc: 'Dynamically import a module by path.' }
        ]} />

        <Callout kind='note' title='Filesystem is a context capability'>
          Disk access is a platform capability, not domain logic. Inject the storage manager and keep
          handlers working with a disk, so a handler that saves a report does not care whether the disk
          is local in dev and cloud in production.
        </Callout>

        <SeeAlso links={[
          { title: 'Incoming event', path: '/docs/essentials/incoming-event' },
          { title: 'Service container & DI', path: '/docs/foundations/container' },
          { title: 'Configuration', path: '/docs/essentials/configuration' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
