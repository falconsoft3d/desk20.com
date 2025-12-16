import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Sidebar from '@/components/dashboard/Sidebar'
import CreateTicketForm from '@/components/tickets/CreateTicketForm'

export default async function NewTicketPage() {
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
            <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Ticket</h1>
            <p className="text-gray-600 mt-1">Completa el formulario para crear un ticket de soporte</p>
          </div>

          <CreateTicketForm />
        </div>
      </main>
    </div>
  )
}
