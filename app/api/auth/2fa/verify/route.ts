import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { authenticator } from 'otplib'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { token, secret } = await request.json()

    if (!token || !secret) {
      return NextResponse.json(
        { error: 'Token y secreto son requeridos' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || '' },
      select: { id: true, twoFactorSecret: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el secret coincida
    if (user.twoFactorSecret !== secret) {
      return NextResponse.json(
        { error: 'Secreto inválido' },
        { status: 400 }
      )
    }

    // Verificar el código TOTP
    const isValid = authenticator.verify({
      token,
      secret
    })

    if (!isValid) {
      return NextResponse.json(
        { error: 'Código inválido. Por favor verifica e intenta nuevamente.' },
        { status: 400 }
      )
    }

    // Activar 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true }
    })

    return NextResponse.json({
      message: 'Autenticación de dos factores activada correctamente'
    })
  } catch (error) {
    console.error('Error al verificar 2FA:', error)
    return NextResponse.json(
      { error: 'Error al verificar el código' },
      { status: 500 }
    )
  }
}
