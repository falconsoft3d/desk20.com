'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface EditCustomerFormProps {
  customer: {
    id: string
    name: string | null
    email: string
    phone: string | null
    location: string | null
    address: string | null
    emailNotifications: boolean
  }
}

export default function EditCustomerForm({ customer }: EditCustomerFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: customer.name || '',
    phone: customer.phone || '',
    location: customer.location || '',
    address: customer.address || '',
    emailNotifications: customer.emailNotifications,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/dashboard/customers')
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Error al actualizar cliente')
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      setError('Error al actualizar cliente')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/dashboard/customers')
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      setError('Error al eliminar cliente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <Link 
          href="/dashboard/customers"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a clientes
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={customer.email}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
          />
          <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.emailNotifications}
              onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Recibir notificaciones por email
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            El cliente recibirá emails cuando se cree un ticket o cuando reciba respuestas
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Eliminar cliente
          </button>

          <div className="flex space-x-3">
            <Link
              href="/dashboard/customers"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
