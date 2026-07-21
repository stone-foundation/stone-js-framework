import { ValidationErrorHandler } from '../app/ValidationErrorHandler'
import { ValidationError } from '@stone-js/validation'
import { IncomingHttpEvent } from '@stone-js/http-core'

vi.mock(import('@stone-js/core'), async (importOriginal) => ({ ...(await importOriginal()), ErrorHandler: vi.fn(() => vi.fn()) }))

describe('ValidationErrorHandler', () => {
  it('maps a ValidationError to a 422 with field-keyed issues', () => {
    const error = new ValidationError('nope', { issues: [{ message: 'Required', path: ['body', 'title'] }] })

    const result = new ValidationErrorHandler().handle(error, {} as unknown as IncomingHttpEvent)

    expect(result).toEqual({
      statusCode: 422,
      content: {
        message: 'The given data failed validation.',
        errors: { 'body.title': ['Required'] }
      }
    })
  })
})
