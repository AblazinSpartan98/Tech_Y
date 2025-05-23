"use client"

import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"

interface VentaActionsProps {
  venta: {
    ID: number
  }
}

export function VentaActions({ venta }: VentaActionsProps) {
  return (
    <Link href={`/cajero/ventas/${venta.ID}`}>
      <Button size="sm" variant="outline">
        <Eye className="h-4 w-4 mr-1" />
        Ver
      </Button>
    </Link>
  )
}
