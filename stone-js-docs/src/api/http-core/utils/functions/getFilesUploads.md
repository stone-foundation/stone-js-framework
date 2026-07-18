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

The incoming event containing the file data.

`IncomingMessage` | \{
`body`: `unknown`;
`headers`: `IncomingHttpHeaders`;
\}

### options

`Record`\<`string`, `any`\>

The options for file upload limits.

## Returns

`Promise`\<\{
  `fields`: `Record`\<`string`, `string`\>;
  `files`: `Record`\<`string`, `UploadedFile`[]\>;
\}\>

A promise that resolves with the uploaded files and fields.
