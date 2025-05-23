"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Eye, Plus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ComprasPage() {
  const [compras, setCompras] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function fetchCompras() {
      try {
        console.log("Fetching purchases...")
        setLoading(true)
        setError(null)
        setErrorDetails(null)

        const response = await fetch("/api/compras")
        if (!response.ok) {
          const errorText = await response.text()
          console.error("API error response:", errorText)
          throw new Error(`Error al cargar compras: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("API response:", data)

        if (data.error) {
          setErrorDetails(data.detail || "No hay detalles disponibles")
          throw new Error(`Error del servidor: ${data.error}`)
        }

        // Check if data is an array
        if (Array.isArray(data)) {
          console.log(`Found ${data.length} purchases`)
          setCompras(data)
        } else {
          console.error("Unexpected data format:", data)
          setCompras([])
          setError("Formato de datos inesperado")
        }
      } catch (err) {
        console.error("Error fetching purchases:", err)
        setError(`Error al cargar compras: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    }

    fetchCompras()
  }, [])

  // Filtrar compras basado en el término de búsqueda
  const filteredCompras = compras.filter(
    (compra: any) =>
      compra.ID?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      compra.ID_Proveedor?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      compra.DNI_Empleado?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Función para navegar a la página de detalles
  const handleViewDetails = (id: string | number) => {
    router.push(`/admin/compras/${id}`)
  }

  // Función para crear una nueva compra
  const handleCreateNewCompra = () => {
    router.push(`/admin/compras/nueva`)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tickets de Compra</h1>
        <Button onClick={handleCreateNewCompra}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Compra
        </Button>
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
          <CardTitle>Historial de Compras a Proveedores</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-6">Cargando compras...</div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-lg">No se pudieron cargar las compras</p>
              <p className="text-sm text-gray-500 mt-2">Intenta recargar la página</p>
            </div>
          ) : filteredCompras.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Buscar por ID, Proveedor o Empleado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <p className="text-sm text-muted-foreground">
                Mostrando {filteredCompras.length} de {compras.length} compras
              </p>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Proveedor ID</TableHead>
                      <TableHead>Empleado DNI</TableHead>
                      <TableHead>Método de Pago ID</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompras.map((compra: any) => (
                      <TableRow key={compra.ID}>
                        <TableCell className="font-medium">{compra.ID}</TableCell>
                        <TableCell className="font-medium">
                          {compra.Fecha ? new Date(compra.Fecha).toLocaleString() : "N/A"}
                        </TableCell>
                        <TableCell className="font-medium">{compra.ID_Proveedor || "N/A"}</TableCell>
                        <TableCell className="font-medium">{compra.DNI_Empleado || "N/A"}</TableCell>
                        <TableCell className="font-medium">{compra.ID_Metodo_Pago || "N/A"}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(compra.ID)}
                            className="font-medium"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No hay compras registradas</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
