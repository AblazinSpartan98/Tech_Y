"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Eye, Plus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  async function fetchTickets() {
    try {
      console.log("Fetching tickets...")
      setLoading(true)
      setError(null)

      const response = await fetch("/api/tickets")
      if (!response.ok) {
        throw new Error(`Error al cargar tickets: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Tickets data:", data)

      if (Array.isArray(data)) {
        console.log(`Found ${data.length} tickets`)
        setTickets(data)
      } else {
        console.error("Unexpected data format:", data)
        setTickets([])
        setError("Formato de datos inesperado")
      }
    } catch (err) {
      console.error("Error fetching tickets:", err)
      setError(`${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  // Filtrar tickets basado en el término de búsqueda
  const filteredTickets = tickets.filter(
    (ticket: any) =>
      ticket.ID?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ID_Cliente?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.DNI_Empleado?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Función para navegar a la página de detalles
  const handleViewDetails = (id: string | number) => {
    router.push(`/admin/tickets/${id}`)
  }

  // Función para crear un nuevo ticket
  const handleCreateNewTicket = () => {
    router.push(`/admin/tickets/nuevo`)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tickets de Venta</h1>
        <Button onClick={handleCreateNewTicket}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Ticket
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-6">Cargando tickets...</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Buscar por ID, Cliente o Empleado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {filteredTickets.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Mostrando {filteredTickets.length} de {tickets.length} tickets
                  </p>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Cliente ID</TableHead>
                          <TableHead>Empleado DNI</TableHead>
                          <TableHead>Método de Pago</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTickets.map((ticket: any) => (
                          <TableRow key={ticket.ID}>
                            <TableCell className="font-medium">{ticket.ID}</TableCell>
                            <TableCell className="font-medium">
                              {ticket.Fecha ? new Date(ticket.Fecha).toLocaleString() : "N/A"}
                            </TableCell>
                            <TableCell className="font-medium">{ticket.ID_Cliente || "N/A"}</TableCell>
                            <TableCell className="font-medium">{ticket.DNI_Empleado || "N/A"}</TableCell>
                            <TableCell className="font-medium">{ticket.ID_Metodo_Pago || "N/A"}</TableCell>
                            <TableCell className="font-medium">
                              {ticket.Total !== null && ticket.Total !== undefined
                                ? `$${Number.parseFloat(ticket.Total).toFixed(2)}`
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(ticket.ID)}
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
                </>
              ) : tickets.length > 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No se encontraron tickets que coincidan con la búsqueda</p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No hay tickets registrados</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
