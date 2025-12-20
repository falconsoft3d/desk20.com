'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  Home, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut, 
  Headphones,
  UserCircle,
  Tag
} from 'lucide-react'

interface SidebarProps {
  user?: {
    name?: string | null
    email?: string
    role?: string
  }
  openTicketsCount?: number
}

export default function Sidebar({ user, openTicketsCount }: SidebarProps) {
  const pathname = usePathname()
  const userRole = user?.role || 'CUSTOMER'

  // Definir navegación según el rol
  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['CUSTOMER', 'AGENT', 'ADMIN'] },
    { name: 'Tickets', href: '/dashboard/tickets', icon: MessageSquare, roles: ['CUSTOMER', 'AGENT', 'ADMIN'] },
    { name: 'Categorías', href: '/dashboard/categories', icon: Tag, roles: ['AGENT', 'ADMIN'] },
    { name: 'Clientes', href: '/dashboard/customers', icon: Users, roles: ['AGENT', 'ADMIN'] },
    { name: 'Usuarios', href: '/dashboard/users', icon: Users, roles: ['ADMIN'] },
    { name: 'Configuración', href: '/dashboard/settings', icon: Settings, roles: ['ADMIN'] },
  ]

  // Filtrar navegación por rol
  const navigation = allNavigation.filter(item => item.roles.includes(userRole))

  return (
    <div className="w-64 bg-white border-r flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <Headphones className="h-8 w-8 text-primary-600" />
          <span className="text-xl font-bold text-gray-900">Desk20</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isTickets = item.href === '/dashboard/tickets'
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </div>
              {isTickets && openTicketsCount !== undefined && openTicketsCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {openTicketsCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="mb-4 px-4">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <Link
          href="/dashboard/profile"
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition w-full mb-2 ${
            pathname === '/dashboard/profile'
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <UserCircle className="h-5 w-5" />
          <span className="font-medium">Mi Perfil</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition w-full"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}
