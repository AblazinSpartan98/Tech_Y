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
import { ArrowLeft, Plus, Trash2, Warehouse } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Product {
  Codigo: string
  "Nombre del producto": string
  Cantidad: number
  "Precio unitario": number
}

interface PurchaseItem {
  codigo: string
  nombre: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

interface Provider {
  ID: number
  "Nombre de la empresa": string
}

interface PaymentMethod {
  ID: number
  "Metodo de pago": string
}

export default function NuevaCompraPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [products, setProducts] = useState<Product[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)
  const [purchasePrice, setPurchasePrice] = useState<number>(0)
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])
  const [providerId, setProviderId] = useState<string>("")
  const [paymentMethodId, setPaymentMethodId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calcular total
  const total = purchaseItems.reduce((sum, item) => sum + item.subtotal, 0)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // Cargar productos
        const productsResponse = await fetch("/api/productos")
        if (!productsResponse.ok) {
          throw new Error("Error al cargar productos")
        }
        const productsData = await productsResponse.json()
        setProducts(productsData)

        // Cargar proveedores
        const providersResponse = await fetch("/api/proveedores")
        if (!providersResponse.ok) {
          throw new Error("Error al cargar proveedores")
        }
        const providersData = await providersResponse.json()
        setProviders(providersData)

        // Cargar métodos de pago
        const methodsResponse = await fetch("/api/metodos-pago")
        if (!methodsResponse.ok) {
          throw new Error("Error al cargar métodos de pago")
        }
        const methodsData = await methodsResponse.json()
        setPaymentMethods(methodsData)
      } catch (err) {
        setError("Error al cargar los datos")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  function handleAddToCart() {
    if (!selectedProduct || quantity <= 0 || purchasePrice <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selecciona un producto, cantidad y precio válidos",
      })
      return
    }

    const product = products.find((p) => p.Codigo === selectedProduct)
    if (!product) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Producto no encontrado",
      })
      return
    }

    // Verificar si el producto ya está en el carrito
    const existingItemIndex = purchaseItems.findIndex((item) => item.codigo === selectedProduct)

    if (existingItemIndex >= 0) {
      // Actualizar cantidad si ya existe
      const updatedItems = [...purchaseItems]
      const newQuantity = updatedItems[existingItemIndex].cantidad + quantity

      updatedItems[existingItemIndex].cantidad = newQuantity
      updatedItems[existingItemIndex].precioUnitario = purchasePrice
      updatedItems[existingItemIndex].subtotal = newQuantity * purchasePrice
      setPurchaseItems(updatedItems)
    } else {
      // Añadir nuevo item
      const newItem: PurchaseItem = {
        codigo: product.Codigo,
        nombre: product["Nombre del producto"],
        cantidad: quantity,
        precioUnitario: purchasePrice,
        subtotal: quantity * purchasePrice,
      }
      setPurchaseItems([...purchaseItems, newItem])
    }

    // Resetear selección
    setSelectedProduct("")
    setQuantity(1)
    setPurchasePrice(0)

    toast({
      title: "Producto añadido",
      description: `${product["Nombre del producto"]} añadido a la compra`,
    })
  }

  function handleRemoveFromCart(index: number) {
    const updatedItems = [...purchaseItems]
    updatedItems.splice(index, 1)
    setPurchaseItems(updatedItems)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (purchaseItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No hay productos en la compra",
      })
      return
    }

    if (!providerId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selecciona un proveedor",
      })
      return
    }

    if (!paymentMethodId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selecciona un método de pago",
      })
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/compras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          providerId,
          paymentMethodId,
          purchaseItems,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al crear la compra")
      }

      const result = await response.json()

      toast({
        title: "Compra registrada",
        description: `Ticket #${result.ticketId} creado exitosamente`,
      })
      router.push(`/admin/compras/${result.ticketId}`)
    } catch (error) {
      setError("Ha ocurrido un error al procesar la compra")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ha ocurrido un error al procesar la compra",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Nueva Compra</h1>
        <div className="text-center py-6">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/admin/compras" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Nueva Compra</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Añadir Productos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="product">Producto</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.Codigo} value={product.Codigo}>
                          {product["Nombre del producto"]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Precio Unitario</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(Number.parseFloat(e.target.value) || 0)}
                    />
                    <Button onClick={handleAddToCart} type="button">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Productos en la Compra</CardTitle>
            </CardHeader>
            <CardContent>
              {purchaseItems.length === 0 ? (
                <div className="text-center py-6">
                  <Warehouse className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-lg font-medium">No hay productos en la compra</p>
                  <p className="text-sm text-muted-foreground">Añade productos para comenzar.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Producto</th>
                        <th className="py-2 text-right">Precio</th>
                        <th className="py-2 text-right">Cantidad</th>
                        <th className="py-2 text-right">Subtotal</th>
                        <th className="py-2 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseItems.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{item.nombre}</td>
                          <td className="py-2 text-right">
                            {new Intl.NumberFormat("es-MX", {
                              style: "currency",
                              currency: "MXN",
                            }).format(item.precioUnitario)}
                          </td>
                          <td className="py-2 text-right">{item.cantidad}</td>
                          <td className="py-2 text-right">
                            {new Intl.NumberFormat("es-MX", {
                              style: "currency",
                              currency: "MXN",
                            }).format(item.subtotal)}
                          </td>
                          <td className="py-2 text-right">
                            <Button variant="destructive" size="sm" onClick={() => handleRemoveFromCart(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-bold">
                        <td className="py-2" colSpan={3}>
                          Total
                        </td>
                        <td className="py-2 text-right">
                          {new Intl.NumberFormat("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          }).format(total)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Finalizar Compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="provider">Proveedor</Label>
                  <Select value={providerId} onValueChange={setProviderId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.ID.toString()} value={provider.ID.toString()}>
                          {provider["Nombre de la empresa"]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Método de Pago</Label>
                  <Select value={paymentMethodId} onValueChange={setPaymentMethodId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.ID.toString()} value={method.ID.toString()}>
                          {method["Metodo de pago"]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Subtotal</span>
                    <span>
                      {new Intl.NumberFormat("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      }).format(total)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>
                      {new Intl.NumberFormat("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      }).format(total)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting || purchaseItems.length === 0}>
                  {isSubmitting ? "Procesando..." : "Registrar Compra"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
