'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

interface PublicTicketFormProps {
  customerId: string
}

export default function PublicTicketForm({ customerId }: PublicTicketFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [ticketNumber, setTicketNumber] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'NORMAL',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          customerId,
        }),
      })

      if (response.ok) {
        const ticket = await response.json()
        setTicketNumber(ticket.number)
        setSuccess(true)
        setFormData({
          subject: '',
          description: '',
          priority: 'NORMAL',
        })
      } else {
        alert('Error al crear el ticket')
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Error al crear el ticket')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Ticket Creado!
        </h2>
        <p className="text-gray-600 mb-4">
          Tu ticket #{ticketNumber} ha sido creado exitosamente.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Nuestro equipo de soporte lo revisará pronto y te contactará por email.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Crear Otro Ticket
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Asunto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Describe brevemente tu problema"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Proporciona todos los detalles posibles sobre tu problema..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prioridad
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="LOW">Baja</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear Ticket'}
          </button>
        </div>
      </form>
    </div>
  )
}
