import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/dashboard/Sidebar'
import CustomersTable from '@/components/customers/CustomersTable'
import CreateCustomerButton from '@/components/customers/CreateCustomerButton'
import CustomerStats from '@/components/customers/CustomerStats'

export default async function CustomersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const [customers, stats] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: 'CUSTOMER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        phone: true,
        location: true,
        address: true,
        organizationId: true,
        createdAt: true,
        organization: {
          select: {
            id: true,
            name: true,
          }
        },
        _count: {
          select: {
            createdTickets: true,
          }
        },
        createdTickets: {
          select: {
            status: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.$transaction([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.ticket.count({ where: { customer: { role: 'CUSTOMER' }, status: 'OPEN' } }),
      prisma.ticket.count({ where: { customer: { role: 'CUSTOMER' } } }),
    ])
  ])

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={session.user} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
              <p className="text-gray-600 mt-1">Gestiona tu base de clientes</p>
            </div>
            <CreateCustomerButton />
          </div>

          <CustomerStats 
            totalCustomers={stats[0]}
            openTickets={stats[1]}
            totalTickets={stats[2]}
          />

          <CustomersTable customers={customers} />
        </div>
      </main>
    </div>
  )
}
