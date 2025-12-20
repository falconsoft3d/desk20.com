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

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || '' },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Desactivar 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        twoFactorEnabled: false,
        twoFactorSecret: null
      }
    })

    return NextResponse.json({
      message: 'Autenticación de dos factores desactivada'
    })
  } catch (error) {
    console.error('Error al desactivar 2FA:', error)
    return NextResponse.json(
      { error: 'Error al desactivar 2FA' },
      { status: 500 }
    )
  }
}
