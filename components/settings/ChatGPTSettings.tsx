'use client'

import { useState } from 'react'
import { Key, Eye, EyeOff } from 'lucide-react'

interface ChatGPTSettingsProps {
  initialApiKey?: string
}

export default function ChatGPTSettings({ initialApiKey }: ChatGPTSettingsProps) {
  const [apiKey, setApiKey] = useState(initialApiKey || '')
  const [showApiKey, setShowApiKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'chatgpt_api_key',
          value: apiKey,
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'API Key guardado correctamente' })
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Error al guardar' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar la configuración' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <Key className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Integración ChatGPT</h2>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {message && (
          <div
            className={`px-4 py-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Key de ChatGPT
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Obtén tu API key en{' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              platform.openai.com
            </a>
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !apiKey.trim()}
          className="w-full px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {saving ? 'Guardando...' : 'Guardar API Key'}
        </button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-800">
            <strong>Importante:</strong> El API key se guarda de forma segura en la base de datos. Nunca compartas tu API key.
          </p>
        </div>
      </div>
    </div>
  )
}
