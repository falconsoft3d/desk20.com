'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { TicketStatus, TicketPriority } from '@prisma/client'

interface Ticket {
  id: string
  number: number
  subject: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: Date
  updatedAt: Date
  customer: {
    id: string
    name: string | null
    email: string
    avatar: string | null
  }
  assignee: {
    id: string
    name: string | null
    email: string
  } | null
  _count: {
    messages: number
  }
}

interface TicketListProps {
  tickets: Ticket[]
  currentUserId?: string
}

const statusColors = {
  OPEN: 'bg-red-100 text-red-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  SOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
}

const statusLabels = {
  OPEN: 'Abierto',
  PENDING: 'Pendiente',
  SOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
}

const priorityColors = {
  LOW: 'text-gray-600',
  NORMAL: 'text-blue-600',
  HIGH: 'text-orange-600',
  URGENT: 'text-red-600',
}

const priorityLabels = {
  LOW: 'Baja',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  URGENT: 'Urgente',
}

export default function TicketList({ tickets, currentUserId }: TicketListProps) {
  const handleAssign = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assigneeId: currentUserId,
        }),
      })

      if (res.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error al asignar ticket:', error)
    }
  }
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Tickets Recientes</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ticket
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prioridad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asignado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actualizado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link 
                    href={`/dashboard/tickets/${ticket.id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    #{ticket.number}
                  </Link>
                  <div className="text-sm text-gray-900 mt-1">{ticket.subject}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {ticket._count.messages} mensajes
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {ticket.customer.name?.[0] || ticket.customer.email[0].toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {ticket.customer.name || 'Sin nombre'}
                      </div>
                      <div className="text-sm text-gray-500">{ticket.customer.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[ticket.status]}`}>
                    {statusLabels[ticket.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${priorityColors[ticket.priority]}`}>
                    {priorityLabels[ticket.priority]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.assignee ? (
                    <span>{ticket.assignee.name || ticket.assignee.email}</span>
                  ) : (
                    <button
                      onClick={() => handleAssign(ticket.id)}
                      className="px-3 py-1 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-md transition"
                    >
                      Asignármelo
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(ticket.updatedAt), 'PPp', { locale: es })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
