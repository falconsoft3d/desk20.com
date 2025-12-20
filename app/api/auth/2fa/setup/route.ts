import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'

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
      select: { id: true, email: true, name: true, twoFactorEnabled: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'La autenticación de dos factores ya está activada' },
        { status: 400 }
      )
    }

    // Generar secreto para TOTP
    const secret = authenticator.generateSecret()

    // Generar URL para el código QR
    const otpauthUrl = authenticator.keyuri(
      user.email,
      'Desk20',
      secret
    )

    // Generar código QR
    const qrCode = await QRCode.toDataURL(otpauthUrl)

    // Guardar el secreto temporalmente (se confirmará después de verificar)
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret }
    })

    return NextResponse.json({
      qrCode,
      secret,
      message: 'Escanea el código QR con tu aplicación de autenticación'
    })
  } catch (error) {
    console.error('Error al configurar 2FA:', error)
    return NextResponse.json(
      { error: 'Error al configurar 2FA' },
      { status: 500 }
    )
  }
}
