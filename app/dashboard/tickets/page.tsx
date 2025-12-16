import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/dashboard/Sidebar'
import TicketsTable from '@/components/tickets/TicketsTable'
import CreateTicketButton from '@/components/tickets/CreateTicketButton'
import TicketFilters from '@/components/tickets/TicketFilters'
import Pagination from '@/components/tickets/Pagination'

interface SearchParams {
  status?: string
  priority?: string
  assignee?: string
  search?: string
  page?: string
}

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const page = parseInt(searchParams.page || '1')
  const perPage = 20
  const skip = (page - 1) * perPage

  const whereClause: any = {}
  
  if (searchParams.status) {
    whereClause.status = searchParams.status
  }
  
  if (searchParams.priority) {
    whereClause.priority = searchParams.priority
  }
  
  if (searchParams.assignee) {
    if (searchParams.assignee === 'unassigned') {
      whereClause.assigneeId = null
    } else {
      whereClause.assigneeId = searchParams.assignee
    }
  }

  if (searchParams.search) {
    whereClause.subject = {
      contains: searchParams.search,
      mode: 'insensitive'
    }
  }

  const [tickets, totalCount, agents] = await Promise.all([
    prisma.ticket.findMany({
      where: whereClause,
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
      skip,
      take: perPage,
    }),
    prisma.ticket.count({ where: whereClause }),
    prisma.user.findMany({
      where: {
        role: {
          in: ['AGENT', 'ADMIN']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    })
  ])

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={session.user} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tickets</h1>
              <p className="text-gray-600 mt-1">Gestiona todos los tickets de soporte</p>
            </div>
            <CreateTicketButton />
          </div>

          <TicketFilters 
            currentStatus={searchParams.status}
            currentPriority={searchParams.priority}
            currentAssignee={searchParams.assignee}
            currentSearch={searchParams.search}
            agents={agents}
          />

          <TicketsTable 
            tickets={tickets}
            agents={agents}
            currentUserId={session.user.id}
          />

          <Pagination 
            currentPage={page}
            totalPages={Math.ceil(totalCount / perPage)}
            totalCount={totalCount}
          />
        </div>
      </main>
    </div>
  )
}
