import { getSession } from "@/app/actions/auth"
import { executeQuery } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Eye, ShoppingBag } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"

interface Ticket {
  ID: number
  Fecha: string
  Total: number
  MetodoPago: string
}

async function getClientPurchases(clientId: string) {
  try {
    const tickets = await executeQuery(
      `
      SELECT tv.*, mp.\`Metodo de pago\` as MetodoPago
      FROM Ticket_Venta tv 
      LEFT JOIN \`Metodo de pago\` mp ON tv.ID_Metodo_Pago = mp.ID
      WHERE tv.ID_Cliente = ?
      ORDER BY tv.Fecha DESC
    `,
      [clientId],
    )

    return { tickets, error: null }
  } catch (error) {
    console.error("Error al obtener compras del cliente:", error)
    return { tickets: [], error: "Error al cargar el historial de compras" }
  }
}

export default async function ClientePurchasesPage() {
  const session = await getSession()
  const { tickets, error } = await getClientPurchases(session?.id || "")

  const columns: ColumnDef<Ticket>[] = [
    {
      accessorKey: "ID",
      header: "Ticket #",
    },
    {
      accessorKey: "Fecha",
      header: "Fecha",
      cell: ({ row }) => {
        const date = new Date(row.getValue("Fecha"))
        return (
          <div>
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </div>
        )
      },
    },
    {
      accessorKey: "MetodoPago",
      header: "Método de Pago",
    },
    {
      accessorKey: "Total",
      header: "Total",
      cell: ({ row }) => {
        const total = Number.parseFloat(row.getValue("Total"))
        const formatted = new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        }).format(total)

        return <div>{formatted}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const ticket = row.original

        return (
          <Link href={`/cliente/compras/${ticket.ID}`}>
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4 mr-1" />
              Ver Detalles
            </Button>
          </Link>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Mi Historial de Compras</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compras Realizadas</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-500">{error}</div>
          ) : tickets && tickets.length > 0 ? (
            <DataTable columns={columns} data={tickets} />
          ) : (
            <div className="text-center py-6">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-lg font-medium">No hay compras registradas</p>
              <p className="text-sm text-muted-foreground">Aún no has realizado ninguna compra.</p>
              <div className="mt-4">
                <Link href="/productos">
                  <Button>Ver Productos</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
