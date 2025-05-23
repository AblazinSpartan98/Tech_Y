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

interface Product {
  Codigo: string
  Nombre: string
  Precio: number
  Cantidad: number
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
  const [purchasePrice, setPurchasePrice] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Depuración para ver qué está pasando
  useEffect(() => {
    console.log("Estado actual de productos:", products)
  }, [products])

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        console.log("Cargando productos...")

        // Cargar productos
        const productsResponse = await fetch("/api/productos")
        if (!productsResponse.ok) {
          throw new Error(`Error al cargar productos: ${productsResponse.status}`)
        }

        const productsData = await productsResponse.json()
        console.log("Datos de productos recibidos:", productsData)

        if (!Array.isArray(productsData)) {
          throw new Error("Formato de datos incorrecto: no es un array")
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

  // Actualizar precio cuando se selecciona un producto
  useEffect(() => {
    if (selectedProduct) {
      const product = products.find((p) => p.Codigo === selectedProduct)
      if (product) {
        setPurchasePrice(product.Precio)
      }
    }
  }, [selectedProduct, products])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedProduct || quantity <= 0 || purchasePrice <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selecciona un producto, cantidad y precio válidos",
      })
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const product = products.find((p) => p.Codigo === selectedProduct)
      if (!product) {
        throw new Error("Producto no encontrado")
      }

      const response = await fetch(`/api/compras/${id}/productos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigoProducto: selectedProduct,
          nombreProducto: product.Nombre,
          cantidad: quantity,
          precioUnitario: purchasePrice,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al agregar el producto")
      }

      toast({
        title: "Producto agregado",
        description: `${product.Nombre} agregado a la compra`,
      })
      router.push(`/admin/compras/${id}`)
    } catch (error) {
      setError(`Error al agregar el producto: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ha ocurrido un error al agregar el producto",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link href={`/admin/compras/${id}`} className="mr-4">
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
        <Link href={`/admin/compras/${id}`} className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Agregar Producto a Compra #{id}</h1>
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
                        {product.Nombre} - ${product.Precio.toFixed(2)}
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

            <div className="space-y-2">
              <Label htmlFor="price">Precio Unitario</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number.parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Subtotal</span>
                <span>
                  {new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  }).format(quantity * purchasePrice)}
                </span>
              </div>
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
