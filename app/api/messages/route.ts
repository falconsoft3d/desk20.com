import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, getTicketReplyEmailTemplate } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { ticketId, content, isInternal, type } = await request.json()

    if (!ticketId || !content) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    const message = await prisma.message.create({
      data: {
        content,
        isInternal: isInternal || false,
        type: type || 'COMMENT',
        ticketId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          }
        },
        ticket: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                emailNotifications: true,
              }
            }
          }
        }
      }
    })

    // Update ticket's updatedAt
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() }
    })

    // Enviar email al cliente si no es mensaje interno y el cliente tiene notificaciones activadas
    if (!isInternal && message.ticket.customer.emailNotifications && message.author.role !== 'CUSTOMER') {
      const emailTemplate = getTicketReplyEmailTemplate({
        customerName: message.ticket.customer.name || message.ticket.customer.email,
        ticketNumber: message.ticket.number,
        subject: message.ticket.subject,
        replyContent: content,
        agentName: message.author.name || message.author.email,
      })

      await sendEmail({
        to: message.ticket.customer.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      })
    }

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Error al crear mensaje' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get('ticketId')

    if (!ticketId) {
      return NextResponse.json(
        { error: 'ticketId es requerido' },
        { status: 400 }
      )
    }

    const messages = await prisma.message.findMany({
      where: { ticketId },
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
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Error al obtener mensajes' },
      { status: 500 }
    )
  }
}
