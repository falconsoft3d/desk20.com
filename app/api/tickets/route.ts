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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    const whereClause: any = {
      ...(status && { status: status as any }),
      ...(priority && { priority: priority as any }),
    }

    // Si es CUSTOMER, solo puede ver sus propios tickets
    if (user.role === 'CUSTOMER') {
      whereClause.customerId = user.id
    }

    const tickets = await prisma.ticket.findMany({
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
    const { subject, description, priority, type, categoryId, hours, tags, customerId, attachments } = body

    console.log('Session:', session)
    console.log('CustomerId from body:', customerId)

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
    const finalCustomerId = customerId || session?.user?.id

    console.log('Final customerId:', finalCustomerId)

    if (!finalCustomerId) {
      return NextResponse.json(
        { error: 'No se pudo identificar al usuario' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const userExists = await prisma.user.findUnique({
      where: { id: finalCustomerId }
    })

    if (!userExists) {
      console.error('Usuario no encontrado:', finalCustomerId)
      return NextResponse.json(
        { error: 'Usuario no encontrado en la base de datos' },
        { status: 400 }
      )
    }

    // Preparar los datos del ticket
    const ticketData: any = {
      subject,
      description,
      priority: priority || 'NORMAL',
      tags: tags || [],
      attachments: attachments || [],
      customerId: finalCustomerId,
      status: 'OPEN',
    }

    // Agregar campos opcionales solo si tienen valor
    if (type && ['INCIDENT', 'CHANGE_REQUEST', 'PROJECT'].includes(type)) {
      ticketData.type = type
    }
    
    if (categoryId) {
      ticketData.categoryId = categoryId
    }
    
    if (hours !== null && hours !== undefined && hours !== '') {
      ticketData.hours = parseFloat(hours)
    }

    console.log('Ticket data:', ticketData)

    const ticket = await prisma.ticket.create({
      data: ticketData,
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
