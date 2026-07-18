import './Dropdown.css'
import { FC, ReactNode, useEffect, useRef } from 'react'

interface DropdownOptions {
  show: boolean
  className?: string
  children: ReactNode
  onClose: () => void
  align?: 'left' | 'right'
}

export const Dropdown: FC<DropdownOptions> = ({
  show,
  onClose,
  children,
  align = 'right',
  className = ''
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      const target = e.target as HTMLElement
      if (ref.current?.contains(target) !== true && (target.closest('.dropdown-wrapper') == null)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={ref}
      className={`dropdown-container ${align} ${show ? 'open' : 'closed'} ${className}`}
    >
      {children}
    </div>
  )
}
