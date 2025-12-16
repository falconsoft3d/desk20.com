'use client'

import Link from 'next/link'
import { TicketStatus, TicketPriority } from '@prisma/client'
import { MessageSquare, Clock, CheckCircle, Circle } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    open: number
    pending: number
    solved: number
    total: number
  }
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Abiertos',
      value: stats.open,
      icon: Circle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      link: '/dashboard/tickets?status=OPEN',
    },
    {
      title: 'Pendientes',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      link: '/dashboard/tickets?status=PENDING',
    },
    {
      title: 'Resueltos',
      value: stats.solved,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/dashboard/tickets?status=SOLVED',
    },
    {
      title: 'Total',
      value: stats.total,
      icon: MessageSquare,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      link: '/dashboard/tickets',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Link 
            key={card.title} 
            href={card.link}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
