import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Sidebar from '@/components/dashboard/Sidebar'
import CategoriesTable from '@/components/categories/CategoriesTable'
import CreateCategoryButton from '@/components/categories/CreateCategoryButton'

export const metadata: Metadata = {
  title: 'Categorías | Desk20',
  description: 'Gestión de categorías'
}

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={session?.user} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
              <p className="text-gray-600 mt-2">
                Gestiona las categorías del sistema
              </p>
            </div>
            <CreateCategoryButton />
          </div>

          <CategoriesTable />
        </div>
      </main>
    </div>
  )
}
