import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/dashboard/Sidebar'
import CreateTicketForm from '@/components/tickets/CreateTicketForm'

export default async function NewTicketPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Obtener usuario completo con su rol
  const user = await prisma.user.findUnique({
    where: { email: session.user.email || '' },
    select: { id: true, name: true, email: true, role: true }
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
        <div className="max-w-3xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Ticket</h1>
            <p className="text-gray-600 mt-1">Completa el formulario para crear un ticket de soporte</p>
          </div>

          <CreateTicketForm currentUser={{ id: user.id, role: user.role }} />
        </div>
      </main>
    </div>
  )
}
