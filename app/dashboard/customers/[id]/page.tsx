import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/dashboard/Sidebar'
import EditCustomerForm from '@/components/customers/EditCustomerForm'

export default async function EditCustomerPage({
  params,
}: {
  params: { id: string }
}) {
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

  // Validar que CUSTOMER no pueda acceder a esta página
  if (user.role === 'CUSTOMER') {
    redirect('/dashboard')
  }

  const customer = await prisma.user.findUnique({
    where: { 
      id: params.id,
      role: 'CUSTOMER'
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      location: true,
      address: true,
      emailNotifications: true,
      createdAt: true,
      _count: {
        select: {
          createdTickets: true,
        }
      }
    }
  })

  if (!customer) {
    notFound()
  }

  // AGENT y ADMIN ven todos los tickets
  const openTicketsCount = await prisma.ticket.count({ where: { status: 'OPEN' } })

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} openTicketsCount={openTicketsCount} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Editar Cliente</h1>
            <p className="text-gray-600 mt-1">Actualiza la información del cliente</p>
          </div>

          <EditCustomerForm customer={customer} />
        </div>
      </main>
    </div>
  )
}
