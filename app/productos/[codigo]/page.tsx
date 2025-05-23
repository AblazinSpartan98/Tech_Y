"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShoppingCart, ChevronLeft, Plus, Minus, Package } from "lucide-react"
import CartSidebar from "@/components/cart-sidebar"
import { useToast } from "@/hooks/use-toast"

interface Product {
  Codigo: string
  "Nombre del producto": string
  Cantidad: number
  "Precio unitario": number
  Tipo: string
  Descripcion?: string
  Imagen?: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const codigo = params.codigo as string
  const router = useRouter()
  const { toast } = useToast()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState("")
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        const response = await fetch(`/api/productos/${codigo}`)

        if (!response.ok) {
          throw new Error("Producto no encontrado")
        }

        const data = await response.json()
        setProduct(data)
      } catch (error) {
        console.error("Error al cargar el producto:", error)
        setError("No se pudo cargar el producto")
      } finally {
        setLoading(false)
      }
    }

    if (codigo) {
      fetchProduct()
    }
  }, [codigo])

  const increaseQuantity = () => {
    if (product && quantity < product.Cantidad) {
      setQuantity(quantity + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const addToCart = () => {
    if (!product) return

    try {
      // Obtener carrito actual
      const currentCart = localStorage.getItem("cart")
      const cart = currentCart ? JSON.parse(currentCart) : []

      // Verificar si el producto ya está en el carrito
      const existingItemIndex = cart.findIndex((item: any) => item.codigo === product.Codigo)

      if (existingItemIndex >= 0) {
        // Actualizar cantidad si ya existe
        cart[existingItemIndex].cantidad += quantity
      } else {
        // Agregar nuevo item
        cart.push({
          codigo: product.Codigo,
          nombre: product["Nombre del producto"],
          precio: product["Precio unitario"],
          cantidad: quantity,
        })
      }

      // Guardar carrito actualizado
      localStorage.setItem("cart", JSON.stringify(cart))

      // Mostrar confirmación
      toast({
        title: "Producto agregado",
        description: `${product["Nombre del producto"]} se ha agregado al carrito`,
      })
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    } catch (error) {
      console.error("Error al agregar al carrito:", error)
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Cargando producto...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
          <p className="mb-6 text-gray-500">{error || "No se pudo encontrar el producto solicitado"}</p>
          <Link href="/productos">
            <Button>Ver todos los productos</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline">Iniciar Sesión</Button>
            </Link>
            <Link href="/registro">
              <Button>Crear Cuenta</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/productos" className="flex items-center text-primary hover:underline">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver a productos
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Detalles del producto */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Imagen del producto */}
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  {product.Imagen ? (
                    <img
                      src={product.Imagen || "/placeholder.svg"}
                      alt={product["Nombre del producto"]}
                      className="object-contain max-h-full"
                    />
                  ) : (
                    <Package className="h-24 w-24 text-gray-400" />
                  )}
                </div>

                {/* Información del producto */}
                <div>
                  <h1 className="text-2xl font-bold mb-2">{product["Nombre del producto"]}</h1>
                  <p className="text-gray-500 mb-4">Código: {product.Codigo}</p>
                  <p className="text-gray-500 mb-4">Categoría: {product.Tipo}</p>

                  <div className="mb-6">
                    <p className="text-3xl font-bold text-primary">
                      ${Number.parseFloat(product["Precio unitario"].toString()).toFixed(2)}
                    </p>
                    <p className={`mt-2 ${product.Cantidad > 0 ? "text-green-600" : "text-red-600"}`}>
                      {product.Cantidad > 0 ? `${product.Cantidad} disponibles` : "Agotado"}
                    </p>
                  </div>

                  {product.Cantidad > 0 && (
                    <>
                      <div className="flex items-center mb-6">
                        <span className="mr-4">Cantidad:</span>
                        <div className="flex items-center border rounded-md">
                          <button onClick={decreaseQuantity} className="px-3 py-1 border-r" disabled={quantity <= 1}>
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-1">{quantity}</span>
                          <button
                            onClick={increaseQuantity}
                            className="px-3 py-1 border-l"
                            disabled={quantity >= product.Cantidad}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <Button onClick={addToCart} className="w-full" disabled={addedToCart}>
                        {addedToCart ? "¡Añadido!" : "Añadir al Carrito"}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Descripción y especificaciones */}
              <div className="mt-12">
                <h2 className="text-xl font-semibold mb-4">Descripción</h2>
                <p className="text-gray-700 mb-8">
                  {product.Descripcion ||
                    `${product["Nombre del producto"]} es un producto de alta calidad diseñado para ofrecer el mejor
                  rendimiento en su categoría. Ideal para usuarios que buscan ${product.Tipo.toLowerCase()} de gama
                  ${product["Precio unitario"] > 10000 ? "alta" : product["Precio unitario"] > 5000 ? "media" : "básica"}.`}
                </p>

                <h2 className="text-xl font-semibold mb-4">Especificaciones</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-b pb-2">
                    <span className="font-medium">Código:</span> {product.Codigo}
                  </div>
                  <div className="border-b pb-2">
                    <span className="font-medium">Categoría:</span> {product.Tipo}
                  </div>
                  <div className="border-b pb-2">
                    <span className="font-medium">Precio:</span> $
                    {Number.parseFloat(product["Precio unitario"].toString()).toFixed(2)}
                  </div>
                  <div className="border-b pb-2">
                    <span className="font-medium">Stock:</span> {product.Cantidad} unidades
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carrito */}
          <div className="lg:col-span-3">
            <CartSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
