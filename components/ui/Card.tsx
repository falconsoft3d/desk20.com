import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn('p-6 border-b', className)}>
      {children}
    </div>
  )
}

export function CardContent({ children, className }: CardProps) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className }: CardProps) {
  return (
    <div className={cn('p-6 border-t', className)}>
      {children}
    </div>
  )
}
