import { getClients } from "@/app/actions/cajero"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { UserPlus, Users } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { ClienteActions } from "./cliente-actions"

interface Cliente {
  ID: number
  Nombre: string
  "Apellido Materno": string
  "Apellido Paterno": string
  Direccion: string | null
  Teléfono: string
}

export default async function ClientesPage() {
  const { clients, error } = await getClients()

  const columns = [
    {
      accessorKey: "ID",
      header: "ID",
    },
    {
      accessorKey: "Nombre",
      header: "Nombre",
    },
    {
      accessorKey: "Apellido Paterno",
      header: "Apellido Paterno",
    },
    {
      accessorKey: "Apellido Materno",
      header: "Apellido Materno",
    },
    {
      accessorKey: "Direccion",
      header: "Dirección",
    },
    {
      accessorKey: "Teléfono",
      header: "Teléfono",
    },
    {
      id: "actions",
      header: "Acciones",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Clientes</h1>
        <Link href="/cajero/clientes/nuevo">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-500">{error}</div>
          ) : clients && clients.length > 0 ? (
            <DataTable
              columns={columns}
              data={clients}
              searchColumn="Nombre"
              searchPlaceholder="Buscar por nombre..."
              renderCell={(row, column) => {
                if (column.id === "actions") {
                  return <ClienteActions cliente={row.original} />
                }
                if (column.id === "Direccion") {
                  return row.getValue(column.id) || "No especificada"
                }
                return row.getValue(column.id)
              }}
            />
          ) : (
            <div className="text-center py-6">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-lg font-medium">No hay clientes registrados</p>
              <p className="text-sm text-muted-foreground">Añade tu primer cliente para comenzar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
