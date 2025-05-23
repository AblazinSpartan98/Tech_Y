"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShoppingCart, Loader2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { login } from "@/app/actions/auth"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered")
  const errorParam = searchParams.get("error")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    errorParam === "unauthenticated"
      ? "Debe iniciar sesión para acceder"
      : errorParam === "unauthorized"
        ? "No tiene permisos para acceder a esta sección"
        : null,
  )
  const [userType, setUserType] = useState<"cliente" | "empleado">("cliente")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    formData.append("userType", userType)

    try {
      const result = await login(formData)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        // Redirigir según el rol
        if (result.role === "admin" || result.role === "admin") {
          router.push("/admin")
        } else if (result.role === "cajero") {
          router.push("/cajero")
        } else if (result.role === "bodegero") {
          router.push("/bodegero")
        } else if (result.role === "cliente") {
          // Si hay un carrito pendiente, redirigir a finalizar compra
          const cartItems = localStorage.getItem("cartItems")
          if (cartItems && JSON.parse(cartItems).length > 0) {
            router.push("/checkout")
          } else {
            router.push("/")
          }
        } else {
          router.push("/")
        }
      }
    } catch (error) {
      console.error("Error en inicio de sesión:", error)
      setError("Ocurrió un error al iniciar sesión. Inténtelo de nuevo.")
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
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {registered && (
                <Alert>
                  <AlertDescription>Registro exitoso. Ahora puedes iniciar sesión.</AlertDescription>
                </Alert>
              )}

              <RadioGroup
                value={userType}
                onValueChange={(value) => setUserType(value as "cliente" | "empleado")}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cliente" id="cliente" />
                  <Label htmlFor="cliente">Cliente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="empleado" id="empleado" />
                  <Label htmlFor="empleado">Empleado</Label>
                </div>
              </RadioGroup>

              <div className="space-y-2">
                <Label htmlFor="username">{userType === "cliente" ? "Usuario" : "DNI"}</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder={userType === "cliente" ? "Ingrese su usuario" : "Ingrese su DNI"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" name="password" type="password" placeholder="Ingrese su contraseña" required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
              <div className="text-center text-sm">
                ¿No tienes una cuenta?{" "}
                <Link href="/registro" className="text-primary hover:underline">
                  Regístrate
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
