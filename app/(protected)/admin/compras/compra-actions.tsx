"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

interface CompraActionsProps {
  compra: {
    id_ticket: number
  }
}

export function CompraActions({ compra }: CompraActionsProps) {
  return (
    <Link href={`/admin/compras/${compra.id_ticket}`}>
      <Button variant="outline" size="sm">
        Ver Detalles
      </Button>
    </Link>
  )
}
