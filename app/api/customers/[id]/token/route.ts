import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function POST(
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

    // Generate a unique token
    const token = randomBytes(32).toString('hex')

    // Update customer with public token
    const customer = await prisma.user.update({
      where: { 
        id: params.id,
        role: 'CUSTOMER'
      },
      data: {
        publicToken: token
      },
      select: {
        id: true,
        publicToken: true
      }
    })

    return NextResponse.json({ 
      token: customer.publicToken,
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/public/ticket/${customer.publicToken}`
    })
  } catch (error) {
    console.error('Error generating token:', error)
    return NextResponse.json(
      { error: 'Error al generar el enlace' },
      { status: 500 }
    )
  }
}

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

    const customer = await prisma.user.findUnique({
      where: { 
        id: params.id,
        role: 'CUSTOMER'
      },
      select: {
        id: true,
        publicToken: true
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    if (customer.publicToken) {
      return NextResponse.json({ 
        token: customer.publicToken,
        url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/public/ticket/${customer.publicToken}`
      })
    }

    return NextResponse.json({ 
      token: null,
      url: null
    })
  } catch (error) {
    console.error('Error fetching token:', error)
    return NextResponse.json(
      { error: 'Error al obtener el enlace' },
      { status: 500 }
    )
  }
}
