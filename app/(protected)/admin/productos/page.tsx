"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { ProductActionsCell } from "./product-actions"
import Link from "next/link"
import { AlertCircle, Loader2, PlusCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ProductosPage() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        console.log("Fetching products...")
        setLoading(true)

        const response = await fetch("/api/productos")

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json()
        console.log("Products data received:", data)
        console.log("First product:", data[0])

        setProductos(data)
      } catch (err) {
        console.error("Error al cargar productos:", err)
        setError(`No se pudieron cargar los productos: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    }

    fetchProductos()
  }, [])

  // Configuración de columnas similar a la tabla de empleados
  const columns = [
    {
      id: "Codigo",
      accessorKey: "Codigo",
      header: "Código",
    },
    {
      id: "Nombre del producto",
      accessorKey: "Nombre del producto",
      header: "Nombre",
    },
    {
      id: "Tipo",
      accessorKey: "Tipo",
      header: "Tipo",
    },
    {
      id: "Precio unitario",
      accessorKey: "Precio unitario",
      header: "Precio",
    },
    {
      id: "Cantidad",
      accessorKey: "Cantidad",
      header: "Stock",
    },
    {
      id: "actions",
      header: "Acciones",
    },
  ]

  // Función de renderizado de celdas similar a empleados
  const renderCell = (row: any, column: any) => {
    const value = row.getValue(column.id)

    if (column.id === "actions") {
      return <ProductActionsCell producto={row.original} />
    }

    if (column.id === "Precio unitario") {
      return value ? `$${Number.parseFloat(value).toFixed(2)}` : "N/A"
    }

    return value || "N/A"
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando productos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <Link href="/admin/productos/nuevo">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        {productos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg font-medium mb-2">No hay productos disponibles</p>
            <p className="text-muted-foreground mb-4">Agrega tu primer producto para comenzar</p>
            <Link href="/admin/productos/nuevo">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {productos.length} producto{productos.length !== 1 ? "s" : ""}
              </p>
            </div>
            <DataTable
              columns={columns}
              data={productos}
              renderCell={renderCell}
              searchColumn="Nombre del producto"
              searchPlaceholder="Buscar productos..."
            />
          </>
        )}
      </div>
    </div>
  )
}
