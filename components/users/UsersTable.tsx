'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { UserRole } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { Mail, Phone, MapPin, Ticket, UserCog } from 'lucide-react'
import EditUserModal from './EditUserModal'

interface User {
  id: string
  name: string | null
  email: string
  avatar: string | null
  role: UserRole
  phone: string | null
  location: string | null
  createdAt: Date
  _count: {
    createdTickets: number
    assignedTickets: number
  }
}

interface UsersTableProps {
  users: User[]
}

const roleLabels = {
  ADMIN: 'Administrador',
  AGENT: 'Agente',
  CUSTOMER: 'Cliente',
}

const roleColors = {
  ADMIN: 'bg-purple-100 text-purple-800',
  AGENT: 'bg-blue-100 text-blue-800',
  CUSTOMER: 'bg-green-100 text-green-800',
}

export default function UsersTable({ users }: UsersTableProps) {
  const router = useRouter()
  const [editingUser, setEditingUser] = useState<User | null>(null)

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 text-lg">No se encontraron usuarios</p>
        <p className="text-gray-400 mt-2">Intenta ajustar los filtros</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow hover:shadow-md transition">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-lg">
                      {user.name?.[0] || user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {user.name || 'Sin nombre'}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleColors[user.role]}`}>
                      {roleLabels[user.role]}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => setEditingUser(user)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <UserCog className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="truncate">{user.email}</span>
                </div>
                
                {user.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{user.phone}</span>
                  </div>
                )}
                
                {user.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{user.location}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Ticket className="h-3 w-3 mr-1" />
                    Tickets creados
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {user._count.createdTickets}
                  </p>
                </div>
                
                {user.role === 'AGENT' && (
                  <div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Ticket className="h-3 w-3 mr-1" />
                      Tickets asignados
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {user._count.assignedTickets}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Registrado: {format(new Date(user.createdAt), 'PP', { locale: es })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}
    </>
  )
}
