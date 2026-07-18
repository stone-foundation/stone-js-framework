# Function: getFilesUploads()

```ts
function getFilesUploads(event, options): Promise<{
  fields: Record<string, string>;
  files: Record<string, UploadedFile[]>;
}>;
```

Get file uploads.

Get streamed or pre-read(not streamed) file upload.

## Parameters

### event

  \| `IncomingMessage`
  \| \{
  `body`: `unknown`;
  `headers`: `IncomingHttpHeaders`;
\}

The incoming event containing the file data.

### options

`Record`\<`string`, `any`\>

The options for file upload limits.

## Returns

`Promise`\<\{
  `fields`: `Record`\<`string`, `string`\>;
  `files`: `Record`\<`string`, `UploadedFile`[]\>;
\}\>

A promise that resolves with the uploaded files and fields.
