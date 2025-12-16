'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { MessageType, UserRole } from '@prisma/client'
import { Paperclip } from 'lucide-react'

interface Message {
  id: string
  content: string
  type: MessageType
  isInternal: boolean
  createdAt: Date
  attachments: string[]
  author: {
    id: string
    name: string | null
    email: string
    avatar: string | null
    role: UserRole
  }
}

interface MessageListProps {
  ticket: {
    id: string
    description: string | null
    createdAt: Date
    customer: {
      id: string
      name: string | null
      email: string
      avatar: string | null
    }
  }
  messages: Message[]
  currentUserId: string
}

export default function MessageList({ ticket, messages, currentUserId }: MessageListProps) {
  return (
    <div className="space-y-6">
      {/* Descripción inicial del ticket */}
      {ticket.description && (
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-primary-500">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-medium">
                  {ticket.customer.name?.[0] || ticket.customer.email[0].toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {ticket.customer.name || ticket.customer.email}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-gray-500">
                      {format(new Date(ticket.createdAt), 'PPp', { locale: es })}
                    </p>
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      Descripción del ticket
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">
                {ticket.description}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensajes */}
      {messages.map((message) => {
        const isCurrentUser = message.author.id === currentUserId
        const isInternal = message.isInternal
        const isSystem = message.type === 'SYSTEM'

        return (
          <div key={message.id} className={`${isInternal ? 'bg-yellow-50' : isSystem ? 'bg-gray-50' : 'bg-white'} rounded-lg p-6 shadow-sm`}>
            {isSystem ? (
              // Mensaje de sistema (cambios de estado, asignaciones, etc.)
              <div className="flex items-center justify-center space-x-2">
                <div className="h-px flex-1 bg-gray-300"></div>
                <p className="text-xs text-gray-600 px-4">
                  <span className="font-medium">{message.author.name || message.author.email}</span>: {message.content}
                </p>
                <div className="h-px flex-1 bg-gray-300"></div>
              </div>
            ) : (
              // Mensaje normal
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {message.author.name?.[0] || message.author.email[0].toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {message.author.name || message.author.email}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-500">
                          {format(new Date(message.createdAt), 'PPp', { locale: es })}
                        </p>
                        {isInternal && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-yellow-200 text-yellow-800 rounded">
                            Nota interna
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">
                    {message.content}
                  </div>

                  {message.attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {message.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-primary-600">
                          <Paperclip className="h-4 w-4" />
                          <span>{attachment}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
