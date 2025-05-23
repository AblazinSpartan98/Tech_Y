"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewEmployeePage() {
  const router = useRouter()
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/empleados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          DNI: formData.dni,
          Nombre: formData.nombre,
          "Apellido Paterno": formData.apellidoPaterno,
          "Apellido Materno": formData.apellidoMaterno,
          Puesto: formData.puesto,
          Salario: Number(formData.salario),
          "Fecha de contratacion": formData.fechaContratacion,
          Contra: formData.contra,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al crear el empleado")
      }

      router.push("/admin/empleados")
      router.refresh()
    } catch (error: any) {
      console.error("Error al crear empleado:", error)
      setError(error.message || "Error al crear el empleado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/admin/empleados" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Empleado</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Información del Empleado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input id="dni" name="dni" value={formData.dni} onChange={handleChange} required />
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
                <Label htmlFor="puesto">Puesto</Label>
                <Select value={formData.puesto} onValueChange={(value) => handleSelectChange("puesto", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar puesto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Administrador</SelectItem>
                    <SelectItem value="Cajero">Cajero</SelectItem>
                    <SelectItem value="Bodegero">Bodeguero</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salario">Salario</Label>
                <Input
                  id="salario"
                  name="salario"
                  type="number"
                  value={formData.salario}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaContratacion">Fecha de Contratación</Label>
                <Input
                  id="fechaContratacion"
                  name="fechaContratacion"
                  type="date"
                  value={formData.fechaContratacion}
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
                  required
                />
              </div>
            </div>

            {error && <div className="text-red-500">{error}</div>}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Empleado"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
