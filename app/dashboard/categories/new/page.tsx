import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Sidebar from '@/components/dashboard/Sidebar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CreateCategoryForm from '@/components/categories/CreateCategoryForm'

export const metadata: Metadata = {
  title: 'Nueva Categoría | Desk20',
  description: 'Crear nueva categoría'
}

export default async function NewCategoryPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={session?.user} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Link
            href="/dashboard/categories"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a categorías
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Nueva Categoría</h1>
            <p className="text-gray-600 mt-2">
              Crea una nueva categoría en el sistema
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 max-w-2xl">
            <CreateCategoryForm />
          </div>
        </div>
      </main>
    </div>
  )
}
