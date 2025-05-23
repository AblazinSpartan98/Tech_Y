"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function EditarEmpleadoPage({ params }: { params: { dni: string } }) {
  const dni = params.dni
  const [formData, setFormData] = useState({
    dni: "",
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    puesto: "Cajero",
    salario: "",
    fechaContratacion: new Date().toISOString().split("T")[0],
    contra: "password", // Contraseña por defecto
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchEmpleado = async () => {
      try {
        const response = await fetch(`/api/empleados/${dni}`)
        if (!response.ok) {
          throw new Error("No se pudo cargar el empleado")
        }
        const empleado = await response.json()

        setFormData({
          dni: empleado.DNI,
          nombre: empleado.Nombre,
          apellidoPaterno: empleado["Apellido Paterno"],
          apellidoMaterno: empleado["Apellido Materno"],
          salario: empleado.Salario,
          contra: "", // No mostrar la contraseña por seguridad
          rol: empleado.Rol,
        })
      } catch (error) {
        console.error("Error fetching employee:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información del empleado.",
          variant: "destructive",
        })
        router.push("/admin/empleados")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmpleado()
  }, [dni, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/empleados/${dni}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Empleado actualizado",
          description: "El empleado ha sido actualizado correctamente.",
        })
        router.push("/admin/empleados")
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "No se pudo actualizar el empleado.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el empleado.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Editar Empleado</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información del Empleado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input id="dni" name="dni" value={formData.dni} onChange={handleChange} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidoPaterno">Apellido Paterno</Label>
                <Input
                  id="apellidoPaterno"
                  name="apellidoPaterno"
                  value={formData.apellidoPaterno}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidoMaterno">Apellido Materno</Label>
                <Input
                  id="apellidoMaterno"
                  name="apellidoMaterno"
                  value={formData.apellidoMaterno}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salario">Salario</Label>
                <Input
                  id="salario"
                  name="salario"
                  value={formData.salario}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contra">Contraseña</Label>
                <Input
                  id="contra"
                  name="contra"
                  type="password"
                  value={formData.contra}
                  onChange={handleChange}
                  placeholder="Dejar en blanco para mantener la actual"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <select
                  id="rol"
                  name="rol"
                  className="w-full p-2 border rounded-md"
                  value={formData.rol}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un rol</option>
                  <option value="admin">Administrador</option>
                  <option value="cajero">Cajero</option>
                  <option value="bodegero">Bodeguero</option>
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
