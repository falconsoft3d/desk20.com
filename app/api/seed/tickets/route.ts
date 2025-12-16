import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TicketStatus, TicketPriority } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { count } = await request.json()
    const ticketsToCreate = count || 100

    // Get users for creating tickets
    const [customers, agents] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        select: { id: true }
      }),
      prisma.user.findMany({
        where: { role: { in: ['AGENT', 'ADMIN'] } },
        select: { id: true }
      })
    ])

    if (customers.length === 0) {
      return NextResponse.json(
        { error: 'No hay clientes disponibles. Crea al menos un cliente primero.' },
        { status: 400 }
      )
    }

    const statuses = ['OPEN', 'PENDING', 'SOLVED', 'CLOSED'] as TicketStatus[]
    const priorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as TicketPriority[]
    
    const subjects = [
      'No puedo acceder a mi cuenta',
      'Error al procesar el pago',
      'Problema con la configuración',
      'Solicitud de información',
      'Cambio de plan',
      'Error en la facturación',
      'No recibo notificaciones',
      'Pregunta sobre funcionalidades',
      'Problema de rendimiento',
      'Error al cargar archivos',
      'Solicitud de cancelación',
      'Problema con la integración',
      'No puedo iniciar sesión',
      'Error en el dashboard',
      'Consulta sobre API',
      'Problema con los reportes',
      'Error al guardar cambios',
      'Solicitud de soporte técnico',
      'Problema con la exportación',
      'Consulta sobre seguridad',
    ]

    const descriptions = [
      'He intentado varias veces pero no funciona correctamente.',
      'El sistema muestra un error cuando intento realizar la operación.',
      'Necesito ayuda para resolver este problema lo antes posible.',
      'He seguido las instrucciones pero sigo teniendo dificultades.',
      'Esto está afectando mi trabajo diario, por favor ayuda.',
      'He buscado en la documentación pero no encuentro la solución.',
      'El error aparece de forma intermitente.',
      'Necesito entender mejor cómo funciona esta característica.',
      'He notado esto desde hace varios días.',
      'Me gustaría obtener más información sobre este tema.',
    ]

    // Get the last ticket number
    const lastTicket = await prisma.ticket.findFirst({
      orderBy: { number: 'desc' },
      select: { number: true }
    })

    let currentNumber = lastTicket ? lastTicket.number : 1000

    const tickets = []
    for (let i = 0; i < ticketsToCreate; i++) {
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)]
      const randomAgent = Math.random() > 0.3 && agents.length > 0 
        ? agents[Math.floor(Math.random() * agents.length)] 
        : null
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
      const randomPriority = priorities[Math.floor(Math.random() * priorities.length)]
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
      const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)]

      // Random date within last 30 days
      const daysAgo = Math.floor(Math.random() * 30)
      const createdAt = new Date()
      createdAt.setDate(createdAt.getDate() - daysAgo)

      tickets.push({
        number: ++currentNumber,
        subject: randomSubject,
        description: randomDescription,
        status: randomStatus,
        priority: randomPriority,
        customerId: randomCustomer.id,
        assigneeId: randomAgent?.id || null,
        createdAt,
        updatedAt: createdAt,
      })
    }

    // Create tickets in batches of 20
    const batchSize = 20
    for (let i = 0; i < tickets.length; i += batchSize) {
      const batch = tickets.slice(i, i + batchSize)
      await prisma.ticket.createMany({
        data: batch
      })
    }

    return NextResponse.json({
      message: `${ticketsToCreate} tickets creados exitosamente`,
      created: ticketsToCreate
    })
  } catch (error) {
    console.error('Error creating seed tickets:', error)
    return NextResponse.json(
      { error: 'Error al crear tickets de prueba' },
      { status: 500 }
    )
  }
}
