'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { Filter, Search } from 'lucide-react'

interface TicketFiltersProps {
  currentStatus?: string
  currentPriority?: string
  currentAssignee?: string
  currentSearch?: string
  agents: Array<{
    id: string
    name: string | null
    email: string
  }>
}

export default function TicketFilters({
  currentStatus,
  currentPriority,
  currentAssignee,
  currentSearch,
  agents,
}: TicketFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(currentSearch || '')
  const router = useRouter()
  const pathname = usePathname()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams()
    
    if (currentStatus && key !== 'status') params.set('status', currentStatus)
    if (currentPriority && key !== 'priority') params.set('priority', currentPriority)
    if (currentAssignee && key !== 'assignee') params.set('assignee', currentAssignee)
    if (searchTerm && key !== 'search') params.set('search', searchTerm)
    
    if (value) {
      params.set(key, value)
    }

    const query = params.toString()
    router.push(`${pathname}${query ? `?${query}` : ''}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('search', searchTerm)
  }

  const clearFilters = () => {
    setSearchTerm('')
    router.push(pathname)
  }

  const hasFilters = currentStatus || currentPriority || currentAssignee || currentSearch

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título del ticket..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </form>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-gray-700">
          <Filter className="h-5 w-5" />
          <span className="font-medium">Filtros:</span>
        </div>

        <select
          value={currentStatus || ''}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todos los estados</option>
          <option value="OPEN">Abierto</option>
          <option value="PENDING">Pendiente</option>
          <option value="SOLVED">Resuelto</option>
          <option value="CLOSED">Cerrado</option>
        </select>

        <select
          value={currentPriority || ''}
          onChange={(e) => updateFilter('priority', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todas las prioridades</option>
          <option value="LOW">Baja</option>
          <option value="NORMAL">Normal</option>
          <option value="HIGH">Alta</option>
          <option value="URGENT">Urgente</option>
        </select>

        <select
          value={currentAssignee || ''}
          onChange={(e) => updateFilter('assignee', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todos los agentes</option>
          <option value="unassigned">Sin asignar</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name || agent.email}
            </option>
          ))}
        </select>

        {hasFilters && (
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
