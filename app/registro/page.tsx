"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShoppingCart } from "lucide-react"

export default function RegistroPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    direccion: "",
    telefono: "",
    usuario: "",
    contra: "",
    confirmarContra: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validar datos
      if (
        !formData.nombre ||
        !formData.apellidoPaterno ||
        !formData.apellidoMaterno ||
        !formData.telefono ||
        !formData.usuario ||
        !formData.contra
      ) {
        throw new Error("Por favor complete todos los campos obligatorios")
      }

      if (formData.contra !== formData.confirmarContra) {
        throw new Error("Las contraseñas no coinciden")
      }

      // Crear FormData para enviar
      const data = new FormData()
      data.append("nombre", formData.nombre)
      data.append("apellidoPaterno", formData.apellidoPaterno)
      data.append("apellidoMaterno", formData.apellidoMaterno)
      data.append("direccion", formData.direccion)
      data.append("telefono", formData.telefono)
      data.append("usuario", formData.usuario)
      data.append("contra", formData.contra)

      // Enviar datos al servidor
      const response = await fetch("/api/registro", {
        method: "POST",
        body: data,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al registrar cliente")
      }

      // Redirigir al login
      router.push("/login?registered=true")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <ShoppingCart className="h-6 w-6 text-primary" />
                <span className="ml-2 text-xl font-bold">Tech-Y</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Crear una cuenta</CardTitle>
            <CardDescription>Regístrate para comprar en Tech-Y</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellidoPaterno">Apellido Paterno *</Label>
                <Input
                  id="apellidoPaterno"
                  name="apellidoPaterno"
                  value={formData.apellidoPaterno}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellidoMaterno">Apellido Materno *</Label>
                <Input
                  id="apellidoMaterno"
                  name="apellidoMaterno"
                  value={formData.apellidoMaterno}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usuario">Usuario *</Label>
                <Input id="usuario" name="usuario" value={formData.usuario} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contra">Contraseña *</Label>
                <Input
                  id="contra"
                  name="contra"
                  type="password"
                  value={formData.contra}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarContra">Confirmar Contraseña *</Label>
                <Input
                  id="confirmarContra"
                  name="confirmarContra"
                  type="password"
                  value={formData.confirmarContra}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Procesando..." : "Registrarse"}
              </Button>
              <div className="text-center text-sm">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Iniciar sesión
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
