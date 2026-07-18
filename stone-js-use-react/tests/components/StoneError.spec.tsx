import { renderToString } from 'react-dom/server'
import { StoneError } from '../../src/components/StoneError'

describe('StoneError component', () => {
  it('renders expected HTML', () => {
    const output = renderToString(<StoneError />)
    expect(output).toContain('<h1>An error occured</h1>')
    expect(output).toContain('<p>Sorry, something went wrong.</p>')
  })
})
