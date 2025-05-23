import { getProductsForPurchase } from "@/app/actions/bodegero"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus, Package } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"

interface Product {
  Codigo: string
  "Nombre del producto": string
  Cantidad: number
  "Precio unitario": number
}

export default async function ProductsPage() {
  const { products, error } = await getProductsForPurchase()

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "Codigo",
      header: "Código",
    },
    {
      accessorKey: "Nombre del producto",
      header: "Nombre",
    },
    {
      accessorKey: "Cantidad",
      header: "Cantidad",
    },
    {
      accessorKey: "Precio unitario",
      header: "Precio Unitario",
      cell: ({ row }) => {
        const price = Number.parseFloat(row.getValue("Precio unitario"))
        const formatted = new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        }).format(price)

        return <div>{formatted}</div>
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Productos</h1>
        <Link href="/bodegero/productos/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-500">{error}</div>
          ) : products && products.length > 0 ? (
            <DataTable
              columns={columns}
              data={products}
              searchColumn="Nombre del producto"
              searchPlaceholder="Buscar por nombre..."
            />
          ) : (
            <div className="text-center py-6">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-lg font-medium">No hay productos registrados</p>
              <p className="text-sm text-muted-foreground">Añade tu primer producto para comenzar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
