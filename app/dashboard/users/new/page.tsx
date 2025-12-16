import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Sidebar from '@/components/dashboard/Sidebar'
import CreateUserForm from '@/components/users/CreateUserForm'

export default async function NewUserPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={session.user} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Usuario</h1>
            <p className="text-gray-600 mt-1">Completa el formulario para crear un usuario</p>
          </div>

          <CreateUserForm />
        </div>
      </main>
    </div>
  )
}
