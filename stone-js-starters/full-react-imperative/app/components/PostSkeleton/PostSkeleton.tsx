import React from 'react'
import './PostSkeleton.css'

/**
 * PostSkeleton component.
 */
export const PostSkeleton: React.FC = () => {
  return (
    <div className='post-card skeleton'>
      <div className='post-header'>
        <div className='skeleton-avatar' />
        <div className='skeleton-meta'>
          <div className='skeleton-line short' />
          <div className='skeleton-line tiny' />
        </div>
      </div>
      <div className='skeleton-content'>
        <div className='skeleton-line' />
        <div className='skeleton-line' />
        <div className='skeleton-line half' />
      </div>
      <div className='skeleton-image' />
    </div>
  )
}
