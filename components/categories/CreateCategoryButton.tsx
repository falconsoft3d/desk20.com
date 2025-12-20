'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function CreateCategoryButton() {
  return (
    <Link href="/dashboard/categories/new">
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Nueva Categoría
      </Button>
    </Link>
  )
}
