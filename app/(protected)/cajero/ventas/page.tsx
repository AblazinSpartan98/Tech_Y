import { getClientSales } from "@/app/actions/cajero"
import { getClients } from "@/app/actions/cajero"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { VentaActions } from "./venta-actions"

export default async function VentasPage({ searchParams }: { searchParams: { clientId?: string } }) {
  const clientId = searchParams.clientId || ""
  const { sales, error } = await getClientSales(clientId)
  const { clients } = await getClients()

  const columns = [
    {
      accessorKey: "ID",
      header: "Ticket #",
    },
    {
      accessorKey: "Fecha",
      header: "Fecha",
    },
    {
      accessorKey: "Cliente",
      header: "Cliente",
    },
    {
      accessorKey: "MetodoPago",
      header: "Método de Pago",
    },
    {
      accessorKey: "Total",
      header: "Total",
    },
    {
      id: "actions",
      header: "Acciones",
    },
  ]

  // Transformar los datos para el renderizado
  const formattedSales = sales
    ? sales.map((sale) => ({
        ...sale,
        Fecha: new Date(sale.Fecha).toLocaleString(),
        Cliente: sale.ClienteNombre ? `${sale.ClienteNombre} ${sale.ClienteApellido}` : "Cliente no registrado",
        Total: new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        }).format(sale.Total),
      }))
    : []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Historial de Ventas</h1>
        <Link href="/cajero/carrito">
          <Button>Nueva Venta</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ventas</CardTitle>
          <div className="w-[250px]">
            <Select defaultValue={clientId}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los clientes</SelectItem>
                {clients &&
                  clients.map((client: any) => (
                    <SelectItem key={client.ID.toString()} value={client.ID.toString()}>
                      {client.Nombre} {client["Apellido Paterno"]}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-500">{error}</div>
          ) : formattedSales && formattedSales.length > 0 ? (
            <DataTable
              columns={columns}
              data={formattedSales}
              renderCell={(row, column) => {
                if (column.id === "actions") {
                  return <VentaActions venta={row.original} />
                }
                return row.getValue(column.id)
              }}
            />
          ) : (
            <div className="text-center py-6">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-lg font-medium">No hay ventas registradas</p>
              {clientId && <p className="text-sm text-muted-foreground">Este cliente aún no ha realizado compras.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
