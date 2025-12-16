import { NextResponse } from 'next/server'

export async function GET() {
  const registrationEnabled = process.env.REGISTRATION_ENABLED === 'true'
  
  return NextResponse.json({ enabled: registrationEnabled })
}
