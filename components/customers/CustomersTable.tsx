'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { Mail, Phone, MapPin, Building, Ticket, Edit2, Trash2, Link as LinkIcon, Check } from 'lucide-react'

interface Customer {
  id: string
  name: string | null
  email: string
  avatar: string | null
  phone: string | null
  location: string | null
  address: string | null
  organizationId: string | null
  createdAt: Date
  organization: {
    id: string
    name: string
  } | null
  _count: {
    createdTickets: number
  }
  createdTickets: Array<{
    status: string
  }>
}

interface CustomersTableProps {
  customers: Customer[]
}

export default function CustomersTable({ customers }: CustomersTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loadingToken, setLoadingToken] = useState<string | null>(null)

  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) return

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
    }
  }

  const handleGenerateLink = async (customerId: string) => {
    setLoadingToken(customerId)
    try {
      // Try to get existing token first
      let response = await fetch(`/api/customers/${customerId}/token`)
      let data = await response.json()

      // If no token exists, generate one
      if (!data.token) {
        response = await fetch(`/api/customers/${customerId}/token`, {
          method: 'POST',
        })
        data = await response.json()
      }

      if (data.url) {
        await navigator.clipboard.writeText(data.url)
        setCopiedId(customerId)
        setTimeout(() => setCopiedId(null), 2000)
      }
    } catch (error) {
      console.error('Error generating link:', error)
      alert('Error al generar el enlace')
    } finally {
      setLoadingToken(null)
    }
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 text-lg">No hay clientes registrados</p>
        <p className="text-gray-400 mt-2">Crea tu primer cliente para comenzar</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <input
          type="text"
          placeholder="Buscar clientes por nombre, email u organización..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {filteredCustomers.map((customer) => {
          const openTickets = customer.createdTickets.filter(t => t.status === 'OPEN').length

          return (
            <div key={customer.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-medium text-lg">
                      {customer.name?.[0] || customer.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {customer.name || 'Sin nombre'}
                    </h3>
                    {openTickets > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        {openTickets} ticket{openTickets > 1 ? 's' : ''} abierto{openTickets > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleGenerateLink(customer.id)}
                    disabled={loadingToken === customer.id}
                    className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    title="Copiar enlace para crear tickets"
                  >
                    {copiedId === customer.id ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <LinkIcon className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                    className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </div>
                
                {customer.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                
                {customer.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{customer.location}</span>
                  </div>
                )}

                {customer.organization && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{customer.organization.name}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <Ticket className="h-3 w-3 mr-1" />
                    {customer._count.createdTickets} tickets
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(customer.createdAt), 'PP', { locale: es })}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
