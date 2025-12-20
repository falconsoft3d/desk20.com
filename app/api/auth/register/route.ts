import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    // Check if registration is enabled
    const registrationEnabled = process.env.REGISTRATION_ENABLED === 'true'
    
    if (!registrationEnabled) {
      return NextResponse.json(
        { error: 'El registro de nuevos usuarios ha sido deshabilitado por el administrador' },
        { status: 403 }
      )
    }

    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Verificar si es el primer usuario (será admin)
    const userCount = await prisma.user.count()
    const role = userCount === 0 ? 'ADMIN' : 'CUSTOMER'

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      }
    })

    return NextResponse.json(
      { 
        message: userCount === 0 ? 'Primer usuario creado como administrador' : 'Usuario creado exitosamente',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    )
  }
}
