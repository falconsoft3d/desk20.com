import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/dashboard/Sidebar'
import ProfileForm from '@/components/profile/ProfileForm'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      location: true,
      avatar: true,
      role: true,
      createdAt: true,
    }
  })

  if (!user) {
    redirect('/login')
  }

  // Filtrar contador según el rol
  const countWhere = user.role === 'CUSTOMER' 
    ? { status: 'OPEN' as const, customerId: user.id }
    : { status: 'OPEN' as const }
  const openTicketsCount = await prisma.ticket.count({ where: countWhere })

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} openTicketsCount={openTicketsCount} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600 mt-2">Administra tu información personal y preferencias</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información del usuario */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col items-center">
                  <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold text-primary-600">
                      {user.name?.[0] || user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <span className={`mt-3 px-3 py-1 text-xs font-medium rounded-full ${
                    user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    user.role === 'AGENT' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'ADMIN' ? 'Administrador' : 
                     user.role === 'AGENT' ? 'Agente' : 'Cliente'}
                  </span>
                  <div className="mt-6 pt-6 border-t w-full">
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-gray-500">Miembro desde</p>
                        <p className="font-medium text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString('es', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      {user.phone && (
                        <div>
                          <p className="text-gray-500">Teléfono</p>
                          <p className="font-medium text-gray-900">{user.phone}</p>
                        </div>
                      )}
                      {user.location && (
                        <div>
                          <p className="text-gray-500">Ubicación</p>
                          <p className="font-medium text-gray-900">{user.location}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario de edición */}
            <div className="lg:col-span-2">
              <ProfileForm user={user} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
