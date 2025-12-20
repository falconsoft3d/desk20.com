'use client'

import { useState } from 'react'
import { Shield, Key, Smartphone, AlertCircle, CheckCircle } from 'lucide-react'

interface TwoFactorSettingsProps {
  initialEnabled: boolean
  userId: string
}

export default function TwoFactorSettings({ initialEnabled, userId }: TwoFactorSettingsProps) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [loading, setLoading] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleEnable2FA = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setQrCode(data.qrCode)
        setSecret(data.secret)
        setShowSetup(true)
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Error al configurar 2FA' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Error al configurar 2FA' })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setMessage({ type: 'error', text: 'Ingresa un código de 6 dígitos' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: verificationCode,
          secret: secret
        }),
      })

      if (response.ok) {
        setEnabled(true)
        setShowSetup(false)
        setMessage({ type: 'success', text: 'Autenticación de dos factores activada correctamente' })
        setVerificationCode('')
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Código inválido' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Error al verificar el código' })
    } finally {
      setLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!confirm('¿Estás seguro de que deseas desactivar la autenticación de dos factores?')) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
      })

      if (response.ok) {
        setEnabled(false)
        setMessage({ type: 'success', text: 'Autenticación de dos factores desactivada' })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Error al desactivar 2FA' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Error al desactivar 2FA' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Shield className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Autenticación de Dos Factores</h3>
          <p className="text-sm text-gray-600">Agrega una capa adicional de seguridad a tu cuenta</p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg flex items-start space-x-3 ${
          message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {message.text}
          </p>
        </div>
      )}

      {!showSetup ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Key className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Estado: {enabled ? 'Activado' : 'Desactivado'}</p>
                <p className="text-sm text-gray-600">
                  {enabled 
                    ? 'Se requiere código al iniciar sesión' 
                    : 'Usa solo contraseña para iniciar sesión'}
                </p>
              </div>
            </div>
            <div className={`h-3 w-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>

          {!enabled ? (
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Smartphone className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Necesitarás una aplicación de autenticación</p>
                    <p className="text-blue-700">Recomendamos: Google Authenticator, Microsoft Authenticator o Authy</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleEnable2FA}
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Configurando...' : 'Activar Autenticación de Dos Factores'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleDisable2FA}
              disabled={loading}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Desactivando...' : 'Desactivar Autenticación de Dos Factores'}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-900 mb-4">Configura tu aplicación de autenticación</h4>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-3">
                  <span className="font-medium">Paso 1:</span> Escanea este código QR con tu aplicación de autenticación
                </p>
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  {qrCode && <img src={qrCode} alt="QR Code" className="w-48 h-48" />}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Paso 2:</span> O ingresa este código manualmente:
                </p>
                <div className="bg-white p-3 rounded border border-gray-300 font-mono text-sm text-center">
                  {secret}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-3">
                  <span className="font-medium">Paso 3:</span> Ingresa el código de 6 dígitos de tu aplicación
                </p>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowSetup(false)
                    setVerificationCode('')
                    setMessage(null)
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleVerifyAndEnable}
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? 'Verificando...' : 'Verificar y Activar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
