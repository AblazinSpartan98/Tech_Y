"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { UserPlus, AlertCircle } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { ClienteActions } from "./cliente-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  useEffect(() => {
    async function fetchClientes() {
      try {
        console.log("Fetching clients...")
        setLoading(true)
        setError(null)
        setErrorDetails(null)

        const response = await fetch("/api/clientes")
        if (!response.ok) {
          const errorText = await response.text()
          console.error("API error response:", errorText)
          throw new Error(`Error al cargar clientes: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("API response:", data)

        if (data.error) {
          setErrorDetails(data.detail || "No hay detalles disponibles")
          throw new Error(`Error del servidor: ${data.error}`)
        }

        // Check if clientes exists in the response
        if (data.clientes && Array.isArray(data.clientes)) {
          console.log(`Found ${data.clientes.length} clients`)
          setClientes(data.clientes)
        } else if (Array.isArray(data)) {
          console.log(`Found ${data.length} clients (direct array)`)
          setClientes(data)
        } else {
          console.error("Unexpected data format:", data)
          setClientes([])
          setError("Formato de datos inesperado")
        }
      } catch (err) {
        console.error("Error fetching clients:", err)
        setError(`Error al cargar clientes: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    }

    fetchClientes()
  }, [])

  const columns = [
    {
      id: "ID",
      accessorKey: "ID",
      header: "ID",
    },
    {
      id: "Nombre",
      accessorKey: "Nombre",
      header: "Nombre",
    },
    {
      id: "Apellido Paterno",
      accessorKey: "Apellido Paterno",
      header: "Apellido Paterno",
    },
    {
      id: "Apellido Materno",
      accessorKey: "Apellido Materno",
      header: "Apellido Materno",
    },
    {
      id: "Direccion",
      accessorKey: "Direccion",
      header: "Dirección",
    },
    {
      id: "Teléfono",
      accessorKey: "Teléfono",
      header: "Teléfono",
    },
    {
      id: "actions",
      header: "Acciones",
    },
  ]

  const renderCell = (row: any, column: any) => {
    if (column.id === "actions") {
      return <ClienteActions cliente={row.original} />
    }
    if (column.id === "Direccion") {
      return row.getValue(column.id) || "No especificada"
    }
    return row.getValue(column.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Clientes</h1>
        <Link href="/admin/clientes/nuevo">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            {errorDetails && (
              <details className="mt-2 text-sm">
                <summary>Detalles técnicos</summary>
                <pre className="mt-2 whitespace-pre-wrap bg-slate-950 p-4 rounded-md overflow-auto text-white">
                  {errorDetails}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-6">Cargando clientes...</div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-lg">No se pudieron cargar los clientes</p>
              <p className="text-sm text-gray-500 mt-2">Intenta recargar la página</p>
            </div>
          ) : clientes.length > 0 ? (
            <DataTable
              columns={columns}
              data={clientes}
              searchColumn="Nombre"
              searchPlaceholder="Buscar por nombre..."
              renderCell={renderCell}
            />
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No hay clientes registrados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
