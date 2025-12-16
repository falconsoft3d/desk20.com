import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function CreateTicketButton() {
  return (
    <Link
      href="/dashboard/tickets/new"
      className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
    >
      <Plus className="h-5 w-5" />
      <span>Nuevo Ticket</span>
    </Link>
  )
}
