import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/dashboard/Sidebar'
import ChatGPTSettings from '@/components/settings/ChatGPTSettings'
import TwoFactorSettings from '@/components/settings/TwoFactorSettings'
import { Settings as SettingsIcon, Building2, Mail, Globe, Shield } from 'lucide-react'

export const metadata = {
  title: 'Configuración | Desk20',
  description: 'Configuración del sistema'
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Obtener usuario completo con su rol
  const user = await prisma.user.findUnique({
    where: { email: session.user.email || '' },
    select: { 
      id: true, 
      name: true, 
      email: true, 
      role: true,
      twoFactorEnabled: true 
    }
  })

  if (!user) {
    redirect('/login')
  }

  // Validar que solo ADMIN pueda acceder
  if (user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Solo ADMIN ve todos los tickets
  const openTicketsCount = await prisma.ticket.count({ where: { status: 'OPEN' } })

  // Obtener estadísticas del sistema
  const stats = await prisma.$transaction([
    prisma.user.count(),
    prisma.ticket.count(),
    prisma.category.count(),
    prisma.user.count({ where: { role: 'ADMIN' } }),
  ])

  // Obtener configuración de ChatGPT
  const chatgptSetting = await prisma.setting.findUnique({
    where: { key: 'chatgpt_api_key' }
  })

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} openTicketsCount={openTicketsCount} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
            <p className="text-gray-600 mt-1">Administra la configuración del sistema</p>
          </div>

          {/* Estadísticas del Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats[0]}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats[1]}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categorías</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats[2]}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Administradores</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats[3]}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            {/* Autenticación de Dos Factores */}
            <TwoFactorSettings 
              initialEnabled={user.twoFactorEnabled} 
              userId={user.id}
            />
          </div>

          {/* Secciones de Configuración */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Integración ChatGPT */}
            <ChatGPTSettings initialApiKey={chatgptSetting?.value} />

            {/* Configuración General */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Información General</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Organización
                  </label>
                  <input
                    type="text"
                    defaultValue="Desk20"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Próximamente editable</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de Soporte
                  </label>
                  <input
                    type="email"
                    defaultValue="soporte@desk20.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Próximamente editable</p>
                </div>
              </div>
            </div>

            {/* Configuración de Sistema */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center space-x-3">
                  <SettingsIcon className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Sistema</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Versión del Sistema</p>
                  <p className="text-sm text-gray-600">v1.0.0</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Base de Datos</p>
                  <p className="text-sm text-gray-600">PostgreSQL (Conectado)</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Última Actualización</p>
                  <p className="text-sm text-gray-600">20 de diciembre de 2025</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Las opciones de configuración están en desarrollo. Próximamente podrás editar todos estos valores y personalizar tu sistema.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
