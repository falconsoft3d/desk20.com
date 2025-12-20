import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener usuario con su rol
    const user = await prisma.user.findUnique({
      where: { email: session.user.email || '' },
      select: { id: true, role: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
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
        }
      }
    })

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      )
    }

    // Si es CUSTOMER, validar que solo pueda ver sus propios tickets
    if (user.role === 'CUSTOMER' && ticket.customerId !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json(
      { error: 'Error al obtener ticket' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Obtener el ticket actual para comparar el estado
    const currentTicket = await prisma.ticket.findUnique({
      where: { id: params.id },
      select: { status: true }
    })

    const ticket = await prisma.ticket.update({
      where: { id: params.id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
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
        }
      }
    })

    // Si cambió el estado, crear un mensaje de log
    if (data.status && currentTicket && currentTicket.status !== data.status) {
      const statusLabels: { [key: string]: string } = {
        OPEN: 'Abierto',
        IN_PROGRESS: 'En progreso',
        ON_HOLD: 'En espera',
        RESOLVED: 'Resuelto',
        CLOSED: 'Cerrado'
      }

      const oldStatusLabel = statusLabels[currentTicket.status] || currentTicket.status
      const newStatusLabel = statusLabels[data.status] || data.status

      await prisma.message.create({
        data: {
          ticketId: params.id,
          authorId: session.user.id,
          content: `Estado cambiado de **${oldStatusLabel}** a **${newStatusLabel}**`,
          type: 'SYSTEM',
          isInternal: false
        }
      })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json(
      { error: 'Error al actualizar ticket' },
      { status: 500 }
    )
  }
}
