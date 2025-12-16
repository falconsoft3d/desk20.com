import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, getTicketCreatedEmailTemplate } from '@/lib/email'

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
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    const tickets = await prisma.ticket.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(priority && { priority: priority as any }),
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
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(tickets)
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'Error al obtener tickets' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { subject, description, priority, tags, customerId, attachments } = body

    // Si no hay sesión pero hay customerId (desde formulario público)
    if (!session && !customerId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    if (!subject) {
      return NextResponse.json(
        { error: 'El asunto es requerido' },
        { status: 400 }
      )
    }

    // Usar customerId si se proporciona, sino usar el ID del usuario de la sesión
    const finalCustomerId = customerId || session?.user.id

    const ticket = await prisma.ticket.create({
      data: {
        subject,
        description,
        priority: priority || 'NORMAL',
        tags: tags || [],
        attachments: attachments || [],
        customerId: finalCustomerId,
        status: 'OPEN',
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            emailNotifications: true,
          }
        }
      }
    })

    // Enviar email al cliente si tiene notificaciones activadas
    if (ticket.customer.emailNotifications) {
      const emailTemplate = getTicketCreatedEmailTemplate({
        customerName: ticket.customer.name || ticket.customer.email,
        ticketNumber: ticket.number,
        subject: ticket.subject,
        description: ticket.description || '',
      })

      await sendEmail({
        to: ticket.customer.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      })
    }

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json(
      { error: 'Error al crear ticket' },
      { status: 500 }
    )
  }
}
