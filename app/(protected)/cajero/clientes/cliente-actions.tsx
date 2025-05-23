"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ClienteActionsProps {
  cliente: {
    ID: number
    Nombre: string
    "Apellido Paterno": string
  }
}

export function ClienteActions({ cliente }: ClienteActionsProps) {
  return (
    <div className="flex gap-2">
      <Link href={`/cajero/ventas?clientId=${cliente.ID}`}>
        <Button size="sm" variant="outline">
          Ver Compras
        </Button>
      </Link>
      <Link href={`/cajero/carrito?clientId=${cliente.ID}`}>
        <Button size="sm">Nueva Venta</Button>
      </Link>
    </div>
  )
}
