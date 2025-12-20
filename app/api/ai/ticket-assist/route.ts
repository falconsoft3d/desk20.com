import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { ticketId, userMessage } = await request.json()

    if (!ticketId || !userMessage) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Obtener el ticket completo con todos sus mensajes
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                name: true,
                email: true,
                role: true,
              }
            }
          }
        },
        customer: {
          select: {
            name: true,
            email: true,
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

    // Obtener la API key de ChatGPT
    const apiKeySetting = await prisma.setting.findUnique({
      where: { key: 'chatgpt_api_key' }
    })

    if (!apiKeySetting || !apiKeySetting.value) {
      return NextResponse.json(
        { error: 'API key de ChatGPT no configurada' },
        { status: 400 }
      )
    }

    // Construir el contexto del ticket para ChatGPT
    const ticketContext = `
Información del Ticket:
- Número: #${ticket.number}
- Asunto: ${ticket.subject}
- Descripción inicial: ${ticket.description}
- Prioridad: ${ticket.priority}
- Estado: ${ticket.status}
- Cliente: ${ticket.customer.name || ticket.customer.email}

Historial de mensajes:
${ticket.messages.map((msg, index) => `
${index + 1}. [${msg.author.name || msg.author.email}] (${msg.author.role}) - ${new Date(msg.createdAt).toLocaleString('es-ES')}:
${msg.content}
${msg.isInternal ? '(Nota interna)' : ''}
`).join('\n')}

Nuevo mensaje del agente:
${userMessage}
`.trim()

    // Llamar a la API de ChatGPT
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKeySetting.value}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente virtual de soporte técnico especializado en ayudar a los agentes de atención al cliente. 
Tu tarea es analizar el contexto completo del ticket de soporte y proporcionar respuestas útiles, profesionales y precisas.

Cuando te pidan ayuda:
1. Analiza todo el historial de mensajes del ticket
2. Identifica el problema principal y el estado actual
3. Proporciona respuestas claras y accionables
4. Sugiere pasos o soluciones específicas cuando sea apropiado
5. Mantén un tono profesional pero amigable
6. Si hay información técnica, explícala de manera comprensible

Tu respuesta será visible para el agente, quien puede usarla como borrador o guía para responder al cliente.`
          },
          {
            role: 'user',
            content: ticketContext
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error('Error de OpenAI:', errorData)
      return NextResponse.json(
        { error: 'Error al consultar a ChatGPT' },
        { status: 500 }
      )
    }

    const data = await openaiResponse.json()
    const aiResponse = data.choices[0].message.content

    // Crear un mensaje automático con la respuesta de la IA
    const aiMessage = await prisma.message.create({
      data: {
        content: `🤖 **Asistente IA**:\n\n${aiResponse}`,
        isInternal: true, // Siempre como nota interna
        type: 'COMMENT',
        ticketId,
        authorId: session.user.id, // El mensaje es del usuario que invocó @ia
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
        }
      }
    })

    // Actualizar el timestamp del ticket
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({ 
      success: true,
      message: aiMessage,
      aiResponse 
    }, { status: 200 })

  } catch (error) {
    console.error('Error al procesar mensaje con IA:', error)
    return NextResponse.json(
      { error: 'Error al procesar mensaje con IA' },
      { status: 500 }
    )
  }
}
