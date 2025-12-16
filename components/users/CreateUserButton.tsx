import Link from 'next/link'
import { UserPlus } from 'lucide-react'

export default function CreateUserButton() {
  return (
    <Link
      href="/dashboard/users/new"
      className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
    >
      <UserPlus className="h-5 w-5" />
      <span>Nuevo Usuario</span>
    </Link>
  )
}
