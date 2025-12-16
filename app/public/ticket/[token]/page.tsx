import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PublicTicketForm from '@/components/public/PublicTicketForm'

export default async function PublicTicketPage({
  params,
}: {
  params: { token: string }
}) {
  const customer = await prisma.user.findUnique({
    where: {
      publicToken: params.token,
      role: 'CUSTOMER'
    },
    select: {
      id: true,
      name: true,
      email: true,
    }
  })

  if (!customer) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Ticket</h1>
          <p className="text-gray-600 mt-2">
            Hola {customer.name || customer.email}, describe tu problema y te ayudaremos
          </p>
        </div>

        <PublicTicketForm customerId={customer.id} />
      </div>
    </div>
  )
}
