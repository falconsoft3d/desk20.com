import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { authenticator } from 'otplib'

export async function POST(request: NextRequest) {
  try {
    const { email, password, twoFactorCode } = await request.json()

    if (!email || !password || !twoFactorCode) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        twoFactorEnabled: true,
        twoFactorSecret: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA no está activado' },
        { status: 400 }
      )
    }

    // Verificar el código TOTP
    const isValid = authenticator.verify({
      token: twoFactorCode,
      secret: user.twoFactorSecret
    })

    if (!isValid) {
      return NextResponse.json(
        { error: 'Código de verificación inválido' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verificación exitosa'
    })
  } catch (error) {
    console.error('Error al verificar 2FA en login:', error)
    return NextResponse.json(
      { error: 'Error al verificar código' },
      { status: 500 }
    )
  }
}
