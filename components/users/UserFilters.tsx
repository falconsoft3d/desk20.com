'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Filter } from 'lucide-react'

interface UserFiltersProps {
  currentRole?: string
}

export default function UserFilters({ currentRole }: UserFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()

  const updateFilter = (value: string) => {
    if (value) {
      router.push(`${pathname}?role=${value}`)
    } else {
      router.push(pathname)
    }
  }

  const clearFilters = () => {
    router.push(pathname)
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-gray-700">
          <Filter className="h-5 w-5" />
          <span className="font-medium">Filtros:</span>
        </div>

        <select
          value={currentRole || ''}
          onChange={(e) => updateFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todos los roles</option>
          <option value="ADMIN">Administrador</option>
          <option value="AGENT">Agente</option>
          <option value="CUSTOMER">Cliente</option>
        </select>

        {currentRole && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  )
}
