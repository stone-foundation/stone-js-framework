import { Service } from '@stone-js/core'

/** Metadata for an uploaded object, the only thing your API stores. */
export interface UploadRecord {
  id: string
  key: string
  contentType: string
}

/**
 * UploadService
 *
 * The domain never sees the bytes: the client uploads them straight to storage with a signed URL.
 * Once done, it tells the API, which records only the metadata. In a real app this writes a row.
 */
@Service({ alias: 'uploadService' })
export class UploadService {
  private readonly records: UploadRecord[] = []

  record (data: UploadRecord): UploadRecord {
    this.records.push(data)
    return data
  }

  all (): UploadRecord[] {
    return this.records
  }
}
