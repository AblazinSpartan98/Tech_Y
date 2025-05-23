"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft } from "lucide-react"

export default function NuevoTicketPage() {
  const [loading, setLoading] = useState(false)
  const [clienteId, setClienteId] = useState("")
  const [empleadoDni, setEmpleadoDni] = useState("")
  const [metodoPagoId, setMetodoPagoId] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clienteId || !empleadoDni || !metodoPagoId) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ID_Cliente: clienteId,
          DNI_Empleado: empleadoDni,
          ID_Metodo_Pago: metodoPagoId,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error al crear ticket: ${response.status} ${errorText}`)
      }

      const data = await response.json()

      toast({
        title: "Éxito",
        description: "Ticket creado correctamente",
      })

      // Redirigir a la página de detalles del nuevo ticket
      router.push(`/admin/tickets/${data.ID}`)
    } catch (error) {
      console.error("Error creating ticket:", error)
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={() => router.back()} className="mr-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold">Crear Nuevo Ticket</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="clienteId">ID del Cliente</Label>
                <Input
                  id="clienteId"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  placeholder="Ingrese el ID del cliente"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="empleadoDni">DNI del Empleado</Label>
                <Input
                  id="empleadoDni"
                  value={empleadoDni}
                  onChange={(e) => setEmpleadoDni(e.target.value)}
                  placeholder="Ingrese el DNI del empleado"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metodoPago">Método de Pago</Label>
                <Select onValueChange={setMetodoPagoId} value={metodoPagoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Efectivo</SelectItem>
                    <SelectItem value="2">Tarjeta de Crédito</SelectItem>
                    <SelectItem value="3">Tarjeta de Débito</SelectItem>
                    <SelectItem value="4">Transferencia</SelectItem>
                    <SelectItem value="5">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Ticket"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
