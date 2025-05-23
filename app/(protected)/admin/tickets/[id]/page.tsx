"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, Plus, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DetalleVenta {
  Codigo_Producto: string
  Nombre_Producto: string
  Cantidad: number
  Precio_Unitario: number
  Subtotal: number
}

interface TicketVenta {
  ID: number
  Fecha: string
  Cliente: string
  Empleado: string
  Metodo_Pago: string
  Total: number | string
  Detalles: DetalleVenta[]
}

// Función auxiliar para formatear valores monetarios
const formatCurrency = (value: any): string => {
  // Convertir a número si es posible
  const numValue = typeof value === "string" ? Number.parseFloat(value) : Number(value)

  // Verificar si es un número válido
  if (isNaN(numValue)) {
    return "$0.00"
  }

  // Formatear con 2 decimales
  return `$${numValue.toFixed(2)}`
}

export default function DetalleTicketPage({ params }: { params: { id: string } }) {
  const id = params.id
  const [ticket, setTicket] = useState<TicketVenta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [responseText, setResponseText] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const fetchTicket = async () => {
    try {
      setLoading(true)
      setError(null)
      setResponseText(null)

      console.log(`Fetching ticket details for ID: ${id}`)
      const response = await fetch(`/api/tickets/${id}`)

      // Guardar el texto de la respuesta para depuración
      const text = await response.text()
      setResponseText(text)
      console.log("API Response Text:", text)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${text}`)
      }

      // Intentar parsear la respuesta como JSON
      let data
      try {
        data = JSON.parse(text)
        console.log("Parsed ticket data:", data)
      } catch (parseError) {
        throw new Error(`Error parsing JSON: ${parseError}. Raw response: ${text}`)
      }

      setTicket(data)
    } catch (error) {
      console.error("Error fetching ticket:", error)
      setError(String(error))
      toast({
        title: "Error",
        description: "No se pudo cargar la información del ticket.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTicket()
  }, [id, toast])

  // Función para navegar a la página de agregar producto
  const handleAddProduct = () => {
    router.push(`/admin/tickets/${id}/agregar-producto`)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex justify-center items-center h-[50vh]">
          <p>Cargando detalles del ticket...</p>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Button onClick={fetchTicket}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-red-500">Error al cargar el ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error || "No se encontró el ticket"}</p>

            {responseText && (
              <div className="mt-4">
                <p className="font-medium mb-2">Respuesta de la API:</p>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[300px] text-sm">{responseText}</pre>
              </div>
            )}

            <div className="mt-4">
              <p className="font-medium mb-2">Información de depuración:</p>
              <ul className="list-disc pl-5">
                <li>ID del ticket: {id}</li>
                <li>URL de la API: /api/tickets/{id}</li>
                <li>Tiempo: {new Date().toLocaleString()}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <Button onClick={handleAddProduct}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Producto
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ticket de Venta #{ticket.ID}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Fecha</p>
              <p>{new Date(ticket.Fecha).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cliente</p>
              <p>{ticket.Cliente}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Empleado</p>
              <p>{ticket.Empleado}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Método de Pago</p>
              <p>{ticket.Metodo_Pago}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Código</th>
                  <th className="text-left py-3 px-4">Producto</th>
                  <th className="text-right py-3 px-4">Cantidad</th>
                  <th className="text-right py-3 px-4">Precio Unitario</th>
                  <th className="text-right py-3 px-4">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {ticket.Detalles && ticket.Detalles.length > 0 ? (
                  ticket.Detalles.map((detalle, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{detalle.Codigo_Producto}</td>
                      <td className="py-3 px-4">{detalle.Nombre_Producto}</td>
                      <td className="py-3 px-4 text-right">{detalle.Cantidad}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(detalle.Precio_Unitario)}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(detalle.Subtotal)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-3 px-4 text-center">
                      No hay detalles disponibles para este ticket
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="font-medium">Total:</span>
                <span className="font-bold">{formatCurrency(ticket.Total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
