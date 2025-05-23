import { getProviderPurchases } from "@/app/actions/bodegero"
import { getProviders } from "@/app/actions/bodegero"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Eye, Plus, Warehouse } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"

interface Purchase {
  ID: number
  Fecha: string
  ID_Proveedor: number
  Total: number
  ProveedorNombre?: string
  MetodoPago?: string
}

interface Provider {
  ID: number
  "Nombre de la empresa": string
}

export default async function ComprasPage({ searchParams }: { searchParams: { providerId?: string } }) {
  const providerId = searchParams.providerId || ""
  const { purchases, error } = await getProviderPurchases(providerId)
  const { providers } = await getProviders()

  const columns: ColumnDef<Purchase>[] = [
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
      accessorKey: "ProveedorNombre",
      header: "Proveedor",
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
        const purchase = row.original

        return (
          <Link href={`/bodegero/compras/${purchase.ID}`}>
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Button>
          </Link>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Compras a Proveedores</h1>
        <Link href="/bodegero/compras/nueva">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Compra
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Compras</CardTitle>
          <div className="w-[250px]">
            <Select defaultValue={providerId}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proveedores</SelectItem>
                {providers &&
                  providers.map((provider: Provider) => (
                    <SelectItem key={provider.ID.toString()} value={provider.ID.toString()}>
                      {provider["Nombre de la empresa"]}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-500">{error}</div>
          ) : purchases && purchases.length > 0 ? (
            <DataTable columns={columns} data={purchases} />
          ) : (
            <div className="text-center py-6">
              <Warehouse className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-lg font-medium">No hay compras registradas</p>
              {providerId && <p className="text-sm text-muted-foreground">No hay compras para este proveedor.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
