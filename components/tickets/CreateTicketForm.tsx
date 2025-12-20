'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X, File, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
}

interface Customer {
  id: string
  name: string | null
  email: string
}

interface CreateTicketFormProps {
  currentUser: {
    id: string
    role: string
  }
}

export default function CreateTicketForm({ currentUser }: CreateTicketFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [improvingText, setImprovingText] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [formData, setFormData] = useState({
    customerId: currentUser.role === 'CUSTOMER' ? currentUser.id : '',
    subject: '',
    description: '',
    priority: 'NORMAL',
    type: '',
    categoryId: '',
    hours: '',
    tags: '',
  })
  const [attachments, setAttachments] = useState<File[]>([])

  useEffect(() => {
    fetchCategories()
    if (currentUser.role !== 'CUSTOMER') {
      fetchCustomers()
    }
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAttachments(prev => [...prev, ...newFiles])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = []
    
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      
      try {
        // Por ahora, guardamos solo el nombre del archivo
        // En producción, aquí subirías a un servicio como S3, Cloudinary, etc.
        uploadedUrls.push(file.name)
      } catch (error) {
        console.error('Error uploading file:', error)
      }
    }
    
    return uploadedUrls
  }

  const handleImproveText = async () => {
    if (!formData.description.trim()) {
      setError('Escribe una descripción primero')
      return
    }

    setImprovingText(true)
    setError('')

    try {
      const response = await fetch('/api/ai/improve-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: formData.description,
          subject: formData.subject
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({ ...formData, description: data.improvedText })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al mejorar el texto')
      }
    } catch (error) {
      console.error('Error improving text:', error)
      setError('Error al mejorar el texto')
    } finally {
      setImprovingText(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Subir archivos si hay
      const attachmentUrls = await uploadFiles(attachments)
      
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          customerId: formData.customerId,
          type: formData.type || null,
          categoryId: formData.categoryId || null,
          hours: formData.hours ? parseFloat(formData.hours) : null,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          attachments: attachmentUrls
        }),
      })

      if (response.ok) {
        const ticket = await response.json()
        router.push(`/dashboard/tickets/${ticket.id}`)
      } else {
        setError('Error al crear el ticket')
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      setError('Error al crear el ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <Link 
          href="/dashboard/tickets"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a tickets
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3 pb-4 border-b">
          <Link
            href="/dashboard/tickets"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear Ticket'}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cliente <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            disabled={currentUser.role === 'CUSTOMER'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {currentUser.role === 'CUSTOMER' ? (
              <option value={currentUser.id}>Mi cuenta</option>
            ) : (
              <>
                <option value="">Seleccionar cliente...</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name || customer.email}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

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
            placeholder="Describe el problema brevemente"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <button
              type="button"
              onClick={handleImproveText}
              disabled={improvingText || !formData.description.trim()}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              {improvingText ? 'Mejorando...' : 'Mejorar con IA'}
            </button>
          </div>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Proporciona más detalles sobre el problema"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Usa el botón "Mejorar con IA" para obtener una descripción más clara y profesional
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Seleccionar tipo...</option>
              <option value="INCIDENT">Incidente</option>
              <option value="CHANGE_REQUEST">Solicitud de cambio</option>
              <option value="PROJECT">Proyecto</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Seleccionar categoría...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horas estimadas
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ej: 2.5"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Etiquetas
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Separa las etiquetas con comas (ej: bug, urgente)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Las etiquetas ayudan a organizar y filtrar tickets
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Archivos Adjuntos
          </label>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                Haz clic para subir archivos o arrastra y suelta
              </span>
              <span className="text-xs text-gray-500">
                Imágenes, PDF, DOC, TXT (máx. 10MB)
              </span>
            </label>
          </div>

          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Archivos seleccionados ({attachments.length}):
              </p>
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <File className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
