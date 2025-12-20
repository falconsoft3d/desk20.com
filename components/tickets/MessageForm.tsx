'use client'

import { useState } from 'react'
import { Send, Paperclip, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MessageFormProps {
  ticketId: string
  currentUserId: string
}

export default function MessageForm({ ticketId, currentUserId }: MessageFormProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) return

    setLoading(true)

    try {
      // Detectar si el mensaje contiene @ia
      const hasAiMention = content.toLowerCase().includes('@ia')
      
      if (hasAiMention) {
        // Primero enviar el mensaje del usuario
        const userMessageResponse = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticketId,
            content,
            isInternal: true, // Los mensajes con @ia son internos por defecto
          }),
        })

        if (!userMessageResponse.ok) {
          throw new Error('Error al enviar mensaje')
        }

        // Luego llamar a la IA
        setAiLoading(true)
        const aiResponse = await fetch('/api/ai/ticket-assist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticketId,
            userMessage: content,
          }),
        })

        if (!aiResponse.ok) {
          const errorData = await aiResponse.json()
          console.error('Error de IA:', errorData)
          // No lanzamos error para que el mensaje del usuario sí se guarde
        }
      } else {
        // Mensaje normal sin IA
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticketId,
            content,
            isInternal,
          }),
        })

        if (!response.ok) {
          throw new Error('Error al enviar mensaje')
        }
      }

      setContent('')
      setIsInternal(false)
      router.refresh()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error al enviar el mensaje')
    } finally {
      setLoading(false)
      setAiLoading(false)
    }
  }

  return (
    <div className="bg-white border-t p-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe tu respuesta... (usa @ia para obtener ayuda del asistente)"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
          {content.toLowerCase().includes('@ia') && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-purple-600">
              <Sparkles className="h-4 w-4" />
              <span>El asistente de IA analizará el ticket y te ayudará con una respuesta</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <Paperclip className="h-5 w-5" />
              <span className="text-sm">Adjuntar archivo</span>
            </button>
            
            {!content.toLowerCase().includes('@ia') && (
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Nota interna</span>
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || aiLoading || !content.trim()}
            className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {aiLoading ? (
              <>
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span>Consultando IA...</span>
              </>
            ) : loading ? (
              <>
                <Send className="h-4 w-4" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Enviar</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
