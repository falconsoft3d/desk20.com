import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { text, subject } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'El texto es requerido' },
        { status: 400 }
      )
    }

    // Obtener el API key de ChatGPT desde la configuración
    const setting = await prisma.setting.findUnique({
      where: { key: 'chatgpt_api_key' }
    })

    if (!setting || !setting.value) {
      return NextResponse.json(
        { error: 'API Key de ChatGPT no configurado. Por favor configúralo en Configuración.' },
        { status: 400 }
      )
    }

    // Llamar a la API de OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${setting.value}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente experto en redactar tickets de soporte técnico. Tu tarea es mejorar la descripción del ticket haciéndola más clara, profesional y detallada, manteniendo toda la información relevante. Usa un tono profesional pero amigable. Responde SOLO con el texto mejorado, sin agregar comentarios adicionales.'
          },
          {
            role: 'user',
            content: `Asunto del ticket: ${subject || 'Sin asunto'}\n\nDescripción actual:\n${text}\n\nMejora esta descripción haciendo que sea más clara, estructurada y profesional. Mantén toda la información importante.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Error de OpenAI:', error)
      return NextResponse.json(
        { error: 'Error al procesar con ChatGPT. Verifica tu API Key.' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const improvedText = data.choices[0]?.message?.content || text

    return NextResponse.json({ improvedText })
  } catch (error) {
    console.error('Error al mejorar texto:', error)
    return NextResponse.json(
      { error: 'Error al mejorar el texto' },
      { status: 500 }
    )
  }
}
