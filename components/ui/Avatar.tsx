import React from 'react'
import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

interface AvatarProps {
  src?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg'
  fallback?: string
  className?: string
}

export function Avatar({ src, alt, size = 'md', fallback, className }: AvatarProps) {
  const sizes = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  }

  if (src) {
    return (
      <img
        src={src}
        alt={alt || 'Avatar'}
        className={cn('rounded-full object-cover', sizes[size], className)}
      />
    )
  }

  return (
    <div className={cn(
      'rounded-full bg-primary-100 flex items-center justify-center',
      sizes[size],
      className
    )}>
      {fallback ? (
        <span className="text-primary-600 font-medium">
          {fallback[0]?.toUpperCase()}
        </span>
      ) : (
        <User className="h-1/2 w-1/2 text-primary-600" />
      )}
    </div>
  )
}
