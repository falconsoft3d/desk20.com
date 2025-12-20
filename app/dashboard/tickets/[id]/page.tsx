import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/dashboard/Sidebar'
import TicketHeader from '@/components/tickets/TicketHeader'
import MessageList from '@/components/tickets/MessageList'
import MessageForm from '@/components/tickets/MessageForm'
import TicketSidebar from '@/components/tickets/TicketSidebar'

export default async function TicketDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          phone: true,
          location: true,
          createdAt: true,
        }
      },
      category: {
        select: {
          id: true,
          name: true,
        }
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      messages: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      },
      interactions: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!ticket) {
    notFound()
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={session.user} />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TicketHeader ticket={ticket} />
          
          <div className="flex-1 overflow-y-auto p-6">
            <MessageList 
              ticket={ticket}
              messages={ticket.messages}
              currentUserId={session.user.id}
            />
          </div>

          <MessageForm 
            ticketId={ticket.id}
            currentUserId={session.user.id}
          />
        </div>

        {/* Right sidebar */}
        <TicketSidebar 
          ticket={ticket}
          interactions={ticket.interactions}
        />
      </main>
    </div>
  )
}
