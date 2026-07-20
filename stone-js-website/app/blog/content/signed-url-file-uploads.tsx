import { JSX } from 'react'
import { Code } from '../../docs/components/Code'
import { Architecture } from '../components/Architecture'
import { ArticleLayout, articleHead } from '../ArticleLayout'
import { HeadContext, IPage, Page, ReactIncomingEvent, StoneLink } from '@stone-js/use-react'

const SLUG = 'signed-url-file-uploads'

/**
 * Blog: Direct-to-cloud file uploads with signed URLs (storage architecture).
 */
@Page(`/blog/${SLUG}`, { layout: 'site' })
export class SignedUrlFileUploads implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return articleHead(SLUG)
  }

  render (): JSX.Element {
    return (
      <ArticleLayout slug={SLUG}>
        <p className='doc-lead'>
          A user drops a 2 GB video into your form. If those bytes travel through your API, you now pay
          for the bandwidth twice, hold a request open for minutes, and hit the payload limit of every
          serverless platform you wanted to run on. The fix is to never let the file touch your API at
          all.
        </p>

        <h2>Do not proxy the bytes</h2>
        <p>
          The instinct is to accept the upload on a route and forward it to storage. That instinct is
          the problem. Your API becomes a pipe: it buffers or streams the whole file, its memory and
          timeout budgets are set by the largest thing anyone uploads, and on FaaS or the edge the
          request body cap rejects the upload before your code even runs.
        </p>
        <p>
          Signed URLs remove your API from the data path. The client asks your API for permission, your
          API hands back a short-lived URL that authorises a single upload, and the client sends the
          bytes straight to cloud storage. Your API only ever sees small JSON.
        </p>

        <Architecture
          caption='The bytes go client to cloud, directly. Your API only issues permission and records the result.'
          nodes={[
            { label: 'Client', sub: 'has a large file', tone: 'client' },
            { label: 'Issue signed URL', sub: 'your API, one handler', tone: 'domain' },
            { label: 'Cloud storage', sub: 'direct upload, short TTL', tone: 'external' },
            { label: 'Submit', sub: 'your API, save the record', tone: 'domain' },
            { label: 'Database', sub: 'the metadata, not the bytes', tone: 'store' }
          ]}
        />

        <h2>Two small endpoints</h2>
        <p>
          The whole flow is two ordinary handlers. The first signs a URL that lets the client upload one
          object for a few minutes; the second is called after the upload finishes and records where the
          file landed. Neither ever reads the file.
        </p>
        <Code file='app/UploadController.ts'>{`import { EventHandler, Post } from '@stone-js/router'

@EventHandler('/uploads')
export class UploadController {
  constructor ({ storage, files }) {
    this.storage = storage   // wraps your cloud SDK
    this.files = files       // your metadata store
  }

  // 1. The client asks for permission to upload one object.
  @Post('/sign')
  async sign (event) {
    const { filename, contentType } = event.get('body')
    const key = \`uploads/\${crypto.randomUUID()}/\${filename}\`
    const url = await this.storage.signedPutUrl({ key, contentType, expiresIn: 300 })
    return { key, url }   // small JSON: no bytes here
  }

  // 2. After the direct upload succeeds, the client submits the form.
  @Post('/')
  async submit (event) {
    const { key, title } = event.get('body')
    return this.files.save({ key, title })   // record the pointer, not the file
  }
}`}</Code>
        <p>
          The client uses the returned <code>url</code> to <code>PUT</code> the file directly to storage,
          then posts the form to <code>/uploads</code> with the <code>key</code> it was given. The
          temporary URL expires on its own, so an unfinished upload leaves nothing to clean up.
        </p>

        <h2>The signing lives in a service, for now</h2>
        <p>
          The <code>storage</code> service above is yours today: a thin wrapper around your cloud
          provider's SDK that turns <code>signedPutUrl</code> into a call to S3, R2, GCS or Azure Blob.
          That is a deliberate, honest boundary. The routing, the handlers and the per-event model are
          Stone.js; the signing is one SDK call you own.
        </p>
        <p>
          The ergonomic <code>@stone-js/cloud-file</code> module is on the way. It will make signing,
          TTLs and provider choice a blueprint concern instead of hand-written SDK glue, the same way
          the runtime is already an adapter concern. Until it ships, the pattern on this page is the
          whole recipe and it works on every provider.
        </p>

        <h2>Why it matters</h2>
        <ul>
          <li><strong>No big-payload API.</strong> Your routes only carry small JSON, so they fit inside FaaS and edge body limits and modest timeouts.</li>
          <li><strong>Storage scales, your API does not have to.</strong> The bytes go straight to a service built for them; your API stays cheap and fast.</li>
          <li><strong>Automatic cleanup.</strong> A short TTL means an abandoned upload URL simply expires. There is no orphaned request to unwind.</li>
        </ul>

        <p>
          The two endpoints are plain routing, so read
          <StoneLink to='/docs/routing/matching'> Matching and precedence</StoneLink> for how they are
          chosen, and pair the submit step with
          <StoneLink to='/docs/extensions/validation'> Validation</StoneLink> so the metadata you save is
          well-formed before it reaches your store.
        </p>
      </ArticleLayout>
    )
  }
}
