import React from 'react'
import { StoneContext } from '../../src/StoneContext'
import { render, screen } from '@testing-library/react'
import { StoneContextType } from '../../src/declarations'
import { StonePage } from '../../src/components/StonePage'

describe('StonePage', () => {
  const mockContext: StoneContextType = {
    event: { fingerprint: () => '123' } as any,
    container: { resolve: () => null } as any,
    data: { user: 'John' }
  }

  it('renders children and provides context', () => {
    render(
      <StonePage context={mockContext}>
        <span>Hello Page</span>
      </StonePage>
    )

    expect(screen.getByText('Hello Page')).toBeDefined()
  })

  it('provides context to child components', () => {
    let receivedContext: StoneContextType | undefined

    const ChildComponent = (): any => {
      receivedContext = React.useContext(StoneContext)
      return <div>Child</div>
    }

    render(
      <StonePage context={mockContext}>
        <ChildComponent />
      </StonePage>
    )

    expect(receivedContext).toEqual(mockContext)
  })
})
