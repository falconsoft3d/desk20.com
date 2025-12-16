'use client'

import { useRouter } from 'next/navigation'
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

interface TicketsTableProps {
  tickets: Ticket[]
  agents: Array<{
    id: string
    name: string | null
    email: string
  }>
  currentUserId: string
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

export default function TicketsTable({ tickets, agents, currentUserId }: TicketsTableProps) {
  const router = useRouter()

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 text-lg">No se encontraron tickets</p>
        <p className="text-gray-400 mt-2">Intenta ajustar los filtros o crea un nuevo ticket</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
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
              <tr 
                key={ticket.id} 
                onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-primary-600 font-medium">
                    #{ticket.number}
                  </div>
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
                  {ticket.assignee?.name || 'Sin asignar'}
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
