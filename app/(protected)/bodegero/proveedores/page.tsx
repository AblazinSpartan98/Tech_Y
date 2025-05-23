import { executeQuery } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus, Building } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"

interface Proveedor {
  ID: number
  "Nombre de la empresa": string
  Direccion: string
  Telefono: string
  "Correo electronico": string
}

// Función para obtener todos los proveedores
async function getProviders() {
  try {
    const providers = await executeQuery("SELECT * FROM Proveedor ORDER BY `Nombre de la empresa` ASC")
    return providers
  } catch (error) {
    console.error("Error al obtener proveedores:", error)
    return []
  }
}

export default async function ProveedoresPage() {
  const providers = await getProviders()

  const columns: ColumnDef<Proveedor>[] = [
    {
      accessorKey: "ID",
      header: "ID",
    },
    {
      accessorKey: "Nombre de la empresa",
      header: "Empresa",
    },
    {
      accessorKey: "Direccion",
      header: "Dirección",
    },
    {
      accessorKey: "Telefono",
      header: "Teléfono",
    },
    {
      accessorKey: "Correo electronico",
      header: "Correo Electrónico",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const proveedor = row.original

        return (
          <div className="flex gap-2">
            <Link href={`/bodegero/compras?providerId=${proveedor.ID}`}>
              <Button size="sm" variant="outline">
                Ver Compras
              </Button>
            </Link>
            <Link href={`/bodegero/compras/nueva?providerId=${proveedor.ID}`}>
              <Button size="sm">Nueva Compra</Button>
            </Link>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Proveedores</h1>
        <Link href="/bodegero/proveedores/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proveedor
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proveedores</CardTitle>
        </CardHeader>
        <CardContent>
          {providers && providers.length > 0 ? (
            <DataTable
              columns={columns}
              data={providers}
              searchColumn="Nombre de la empresa"
              searchPlaceholder="Buscar por nombre..."
            />
          ) : (
            <div className="text-center py-6">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-lg font-medium">No hay proveedores registrados</p>
              <p className="text-sm text-muted-foreground">Añade tu primer proveedor para comenzar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
