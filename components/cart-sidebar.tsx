"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Trash2 } from "lucide-react"
import Link from "next/link"

interface CartItem {
  codigo: string
  nombre: string
  precio: number
  cantidad: number
}

export default function CartSidebar() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)

  // Cargar carrito del localStorage al montar el componente
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setCartItems(parsedCart)
      } catch (error) {
        console.error("Error al cargar el carrito:", error)
      }
    }
  }, [])

  // Actualizar total cuando cambia el carrito
  useEffect(() => {
    const newTotal = cartItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
    setTotal(newTotal)

    // Guardar carrito en localStorage
    localStorage.setItem("cart", JSON.stringify(cartItems))
  }, [cartItems])

  // Eliminar un producto del carrito
  const removeFromCart = (codigo: string) => {
    setCartItems((prev) => prev.filter((item) => item.codigo !== codigo))
  }

  // Actualizar cantidad de un producto
  const updateQuantity = (codigo: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setCartItems((prev) => prev.map((item) => (item.codigo === codigo ? { ...item, cantidad: newQuantity } : item)))
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Carrito de Compra
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cartItems.length === 0 ? (
          <div className="text-center py-6">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-muted-foreground">Tu carrito está vacío</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.codigo} className="flex justify-between items-start border-b pb-2">
                <div className="flex-1">
                  <p className="font-medium text-sm line-clamp-1">{item.nombre}</p>
                  <div className="flex items-center mt-1">
                    <button
                      className="w-6 h-6 flex items-center justify-center border rounded-md"
                      onClick={() => updateQuantity(item.codigo, item.cantidad - 1)}
                    >
                      -
                    </button>
                    <span className="mx-2 text-sm">{item.cantidad}</span>
                    <button
                      className="w-6 h-6 flex items-center justify-center border rounded-md"
                      onClick={() => updateQuantity(item.codigo, item.cantidad + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {new Intl.NumberFormat("es-MX", {
                      style: "currency",
                      currency: "MXN",
                    }).format(item.precio * item.cantidad)}
                  </p>
                  <button className="text-red-500 mt-1" onClick={() => removeFromCart(item.codigo)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="flex justify-between w-full mb-4">
          <span className="font-bold">Total:</span>
          <span className="font-bold">
            {new Intl.NumberFormat("es-MX", {
              style: "currency",
              currency: "MXN",
            }).format(total)}
          </span>
        </div>
        <Link href="/checkout" className="w-full">
          <Button className="w-full" disabled={cartItems.length === 0}>
            Proceder al Pago
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
