import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/dashboard/Sidebar'
import TicketList from '@/components/dashboard/TicketList'
import StatsCards from '@/components/dashboard/StatsCards'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  // Obtener usuario completo con su rol
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email || '' },
    select: { id: true, name: true, email: true, role: true }
  })

  // Filtrar tickets según el rol
  const ticketWhere = user?.role === 'CUSTOMER'
    ? { status: 'OPEN' as const, customerId: user.id }
    : { status: 'OPEN' as const }
  
  const tickets = await prisma.ticket.findMany({
    where: ticketWhere,
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        }
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      _count: {
        select: {
          messages: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    },
    take: 3
  })

  // Filtrar estadísticas según el rol
  const statsWhere = user?.role === 'CUSTOMER' ? { customerId: user.id } : {}
  
  const stats = await prisma.$transaction([
    prisma.ticket.count({ where: { ...statsWhere, status: 'OPEN' } }),
    prisma.ticket.count({ where: { ...statsWhere, status: 'PENDING' } }),
    prisma.ticket.count({ where: { ...statsWhere, status: 'SOLVED' } }),
    prisma.ticket.count({ where: statsWhere }),
  ])

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user || undefined} openTicketsCount={stats[0]} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Gestiona tus tickets y conversaciones</p>
          </div>

          <StatsCards 
            stats={{
              open: stats[0],
              pending: stats[1],
              solved: stats[2],
              total: stats[3],
            }}
          />

          <TicketList tickets={tickets} currentUserId={session?.user?.id} />
        </div>
      </main>
    </div>
  )
}
