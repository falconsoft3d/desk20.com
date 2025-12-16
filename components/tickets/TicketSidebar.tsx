'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { User, Mail, Phone, MapPin, Calendar, MessageSquare, ShoppingCart, FileText } from 'lucide-react'
import { InteractionType } from '@prisma/client'

interface TicketSidebarProps {
  ticket: {
    createdAt: Date
    updatedAt: Date
    status: string
    customer: {
      id: string
      name: string | null
      email: string
      phone: string | null
      location: string | null
      createdAt: Date
    }
    assignee: {
      id: string
      name: string | null
      email: string
    } | null
    tags: string[]
  }
  interactions: Array<{
    id: string
    type: InteractionType
    title: string
    createdAt: Date
    user: {
      id: string
      name: string | null
    }
  }>
}

const interactionIcons = {
  CONVERSATION: MessageSquare,
  EMAIL_CHANGE: Mail,
  ORDER: ShoppingCart,
  ARTICLE_VIEW: FileText,
  RECEIPT: FileText,
}

export default function TicketSidebar({ ticket, interactions }: TicketSidebarProps) {
  return (
    <div className="w-80 bg-white border-l overflow-y-auto">
      {/* Customer Info */}
      <div className="p-6 border-b">
        <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">Cliente</h3>
        
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{ticket.customer.name || 'Sin nombre'}</p>
            <p className="text-sm text-gray-500">Cliente</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700">{ticket.customer.email}</span>
          </div>
          
          {ticket.customer.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{ticket.customer.phone}</span>
            </div>
          )}
          
          {ticket.customer.location && (
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{ticket.customer.location}</span>
            </div>
          )}

          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700">
              Cliente desde {format(new Date(ticket.customer.createdAt), 'PP', { locale: es })}
            </span>
          </div>
        </div>
      </div>

      {/* Assignee */}
      <div className="p-6 border-b">
        <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">Asignado a</h3>
        {ticket.assignee ? (
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-medium">
                {ticket.assignee.name?.[0] || ticket.assignee.email[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{ticket.assignee.name}</p>
              <p className="text-sm text-gray-500">{ticket.assignee.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Sin asignar</p>
        )}
      </div>

      {/* Tags */}
      {ticket.tags.length > 0 && (
        <div className="p-6 border-b">
          <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">Etiquetas</h3>
          <div className="flex flex-wrap gap-2">
            {ticket.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Interactions */}
      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">Interacciones</h3>
        
        {/* Tiempos del ticket */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Fecha de Creación</p>
            <p className="text-sm text-gray-900 mt-1">
              {format(new Date(ticket.createdAt), 'PPp', { locale: es })}
            </p>
          </div>
          
          {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
            <>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-medium">Fecha de Resolución</p>
                <p className="text-sm text-gray-900 mt-1">
                  {format(new Date(ticket.updatedAt), 'PPp', { locale: es })}
                </p>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-medium">Tiempo de Resolución</p>
                <p className="text-sm font-semibold text-primary-600 mt-1">
                  {(() => {
                    const diff = new Date(ticket.updatedAt).getTime() - new Date(ticket.createdAt).getTime()
                    const hours = Math.floor(diff / (1000 * 60 * 60))
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                    
                    if (hours > 24) {
                      const days = Math.floor(hours / 24)
                      const remainingHours = hours % 24
                      return `${days}d ${remainingHours}h`
                    }
                    return `${hours}h ${minutes}m`
                  })()}
                </p>
              </div>
            </>
          )}
          
          {ticket.status === 'OPEN' && (
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 uppercase font-medium">Tiempo Abierto</p>
              <p className="text-sm font-semibold text-orange-600 mt-1">
                {(() => {
                  const diff = Date.now() - new Date(ticket.createdAt).getTime()
                  const hours = Math.floor(diff / (1000 * 60 * 60))
                  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                  
                  if (hours > 24) {
                    const days = Math.floor(hours / 24)
                    const remainingHours = hours % 24
                    return `${days}d ${remainingHours}h`
                  }
                  return `${hours}h ${minutes}m`
                })()}
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {interactions.slice(0, 5).map((interaction) => {
            const Icon = interactionIcons[interaction.type] || MessageSquare
            return (
              <div key={interaction.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{interaction.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(interaction.createdAt), 'PPp', { locale: es })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
