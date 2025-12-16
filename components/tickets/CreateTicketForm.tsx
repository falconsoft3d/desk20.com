'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X, File } from 'lucide-react'
import Link from 'next/link'

export default function CreateTicketForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'NORMAL',
    tags: '',
  })
  const [attachments, setAttachments] = useState<File[]>([])

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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Proporciona más detalles sobre el problema"
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

        <div className="flex justify-end space-x-3 pt-4 border-t">
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
      </form>
    </div>
  )
}
