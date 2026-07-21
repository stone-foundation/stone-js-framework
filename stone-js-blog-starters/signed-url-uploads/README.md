# Direct-to-cloud uploads with signed URLs

A Stone.js starter for **uploading large files without proxying the bytes through your API**, the
recipe from
[Direct-to-cloud file uploads with signed URLs](https://stonejs.dev/blog/signed-url-file-uploads).

## The idea

Large files should not travel through your function. The client asks for a short-lived signed URL,
`PUT`s the bytes straight to the bucket, then tells your API, which stores only the metadata.

- `POST /uploads/sign` : mint a signed, direct-to-storage upload target (`temporaryUploadUrl`).
- `POST /uploads/complete` : record only the metadata once the client has uploaded.
- `GET /uploads/:id/url` : mint a short-lived read URL for a private download (`temporaryUrl`).

`@CloudFile({ driver: 's3', ... })` enables cloud storage on the agnostic filesystem contract and
injects the default disk as `fileSystem`. The `s3` driver is S3-compatible, so the same code targets
AWS S3, Cloudflare R2, MinIO, DigitalOcean Spaces and more by setting `endpoint`. The handler
feature-detects with `supportsSignedUrls(...)`, since the local driver has none.

## Run it

```bash
npm install
# standard AWS credentials in the environment
AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=... npm run dev
```

```bash
# 1. ask for an upload target
curl -s -X POST localhost:<port>/uploads/sign -d '{"id":"u1"}'
# 2. PUT the file straight to the returned url (never through the API)
# 3. record the metadata
curl -s -X POST localhost:<port>/uploads/complete -d '{"id":"u1"}'
```

## Test

```bash
npm test
```
