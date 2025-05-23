"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

// Interfaz adaptable a la estructura real de la base de datos
interface Product {
  Codigo: string
  [key: string]: any // Para manejar cualquier estructura de columnas
}

export default function AgregarProductoPage({ params }: { params: { id: string } }) {
  const id = params.id
  const router = useRouter()
  const { toast } = useToast()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Función para obtener el nombre del producto
  const getProductName = (product: Product): string => {
    // Intentar diferentes nombres de columnas posibles
    if (product["Nombre del producto"]) return product["Nombre del producto"]
    if (product.Nombre) return product.Nombre
    if (product.nombre) return product.nombre
    return `Producto ${product.Codigo}`
  }

  // Función para obtener el precio del producto
  const getProductPrice = (product: Product): number => {
    // Intentar diferentes nombres de columnas posibles
    if (product["Precio unitario"] !== undefined) return Number(product["Precio unitario"])
    if (product.Precio !== undefined) return Number(product.Precio)
    if (product.precio !== undefined) return Number(product.precio)
    return 0
  }

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        console.log("Cargando productos...")

        // Cargar productos
        const productsResponse = await fetch("/api/productos")

        console.log("Estado de la respuesta:", productsResponse.status)

        if (!productsResponse.ok) {
          const errorText = await productsResponse.text()
          console.error("Respuesta de error:", errorText)
          throw new Error(`Error al cargar productos: ${productsResponse.status}`)
        }

        const productsData = await productsResponse.json()
        console.log("Datos de productos recibidos:", productsData)

        if (!Array.isArray(productsData)) {
          console.error("Formato incorrecto:", productsData)
          throw new Error("Formato de datos incorrecto: no es un array")
        }

        // Verificar la estructura de los datos
        if (productsData.length > 0) {
          console.log("Estructura del primer producto:", Object.keys(productsData[0]))
        }

        setProducts(productsData)
      } catch (err) {
        console.error("Error al cargar productos:", err)
        setError(`Error al cargar los productos: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedProduct || quantity <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selecciona un producto y cantidad válidos",
      })
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      console.log("📤 Enviando datos:", {
        codigoProducto: selectedProduct,
        cantidad: quantity,
      })

      const response = await fetch(`/api/tickets/${id}/productos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigoProducto: selectedProduct,
          cantidad: quantity,
        }),
      })

      console.log("📥 Estado de la respuesta:", response.status)

      let responseData
      try {
        responseData = await response.json()
        console.log("📋 Datos de respuesta:", responseData)
      } catch (parseError) {
        console.error("❌ Error al parsear respuesta JSON:", parseError)
        throw new Error("Respuesta del servidor inválida")
      }

      if (!response.ok) {
        console.error("❌ Error en la respuesta:", responseData)
        throw new Error(responseData.message || `Error del servidor: ${response.status}`)
      }

      if (!responseData.success) {
        throw new Error(responseData.message || "Error desconocido")
      }

      const product = products.find((p) => p.Codigo === selectedProduct)

      toast({
        title: "✅ Producto agregado",
        description: `${product ? getProductName(product) : "Producto"} agregado al ticket correctamente`,
      })

      // Esperar un momento antes de redirigir para que el usuario vea el mensaje
      setTimeout(() => {
        router.push(`/admin/tickets/${id}`)
      }, 1000)
    } catch (error) {
      console.error("💥 Error completo:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setError(`Error al agregar el producto: ${errorMessage}`)
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link href={`/admin/tickets/${id}`} className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Agregar Producto</h1>
        </div>
        <div className="text-center py-6">Cargando productos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href={`/admin/tickets/${id}`} className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Agregar Producto al Ticket #{id}</h1>
      </div>

      <Card className="max-w-md mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Información del Producto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {products.length === 0 ? (
              <Alert>
                <AlertDescription>No hay productos disponibles</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="product">Producto</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.Codigo} value={product.Codigo}>
                        {getProductName(product)} - ${getProductPrice(product).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting || products.length === 0}>
              {isSubmitting ? "Procesando..." : "Agregar Producto"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
