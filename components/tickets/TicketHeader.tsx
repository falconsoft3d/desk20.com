'use client'

import { useState, useEffect } from 'react'
import { TicketStatus, TicketPriority } from '@prisma/client'
import { ArrowLeft, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface TicketHeaderProps {
  ticket: {
    id: string
    number: number
    subject: string
    status: TicketStatus
    priority: TicketPriority
    assignee: {
      id: string
      name: string | null
      email: string
    } | null
  }
}

const statusLabels = {
  OPEN: 'Abierto',
  PENDING: 'Pendiente',
  SOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
}

const priorityLabels = {
  LOW: 'Baja',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  URGENT: 'Urgente',
}

export default function TicketHeader({ ticket }: TicketHeaderProps) {
  const router = useRouter()
  const [agents, setAgents] = useState<Array<{ id: string; name: string | null; email: string }>>([])
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    // Fetch agents for assignment
    fetch('/api/users?role=AGENT,ADMIN')
      .then(res => res.json())
      .then(data => setAgents(data))
      .catch(err => console.error('Error fetching agents:', err))
  }, [])

  const handleStatusChange = async (newStatus: TicketStatus) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleAssigneeChange = async (assigneeId: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId: assigneeId || null })
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating assignee:', error)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/dashboard"
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Ticket #{ticket.number}
              </h1>
              
              {/* Status Dropdown */}
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                disabled={updating}
                className="px-3 py-1 text-sm font-medium rounded-full border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <option value="OPEN">{statusLabels.OPEN}</option>
                <option value="PENDING">{statusLabels.PENDING}</option>
                <option value="SOLVED">{statusLabels.SOLVED}</option>
                <option value="CLOSED">{statusLabels.CLOSED}</option>
              </select>

              <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100">
                Prioridad: {priorityLabels[ticket.priority]}
              </span>
            </div>
            <p className="text-gray-600 mt-1">{ticket.subject}</p>
          </div>
        </div>
        
        {/* Assignee Dropdown */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <select
              value={ticket.assignee?.id || ''}
              onChange={(e) => handleAssigneeChange(e.target.value)}
              disabled={updating}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <option value="">Sin asignar</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name || agent.email}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
