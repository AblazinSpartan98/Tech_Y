"use client"

import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { useRouter } from "next/navigation"

interface TicketActionsProps {
  id: string | number
}

export function TicketActions({ id }: TicketActionsProps) {
  const router = useRouter()

  const handleView = () => {
    router.push(`/admin/tickets/${id}`)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleView} className="font-medium">
      <Eye className="h-4 w-4 mr-1" />
      Ver detalles
    </Button>
  )
}
