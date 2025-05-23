"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, CreditCard, Banknote } from "lucide-react"

interface CartItem {
  codigo: string
  nombre: string
  precio: number
  cantidad: number
}

interface CheckoutFormProps {
  userId: string | number
}

export default function CheckoutForm({ userId }: CheckoutFormProps) {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState("1") // 1 = Efectivo por defecto
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Cargar carrito del localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setCartItems(parsedCart)

        // Calcular total
        const newTotal = parsedCart.reduce((sum: number, item: CartItem) => sum + item.precio * item.cantidad, 0)
        setTotal(newTotal)
      } catch (error) {
        console.error("Error al cargar el carrito:", error)
        setError("Error al cargar el carrito")
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cartItems.length === 0) {
      setError("El carrito está vacío")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Crear la venta
      const response = await fetch("/api/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clienteId: userId,
          metodoPagoId: paymentMethod,
          productos: cartItems.map((item) => ({
            codigo: item.codigo,
            cantidad: item.cantidad,
            precioUnitario: item.precio,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al procesar la compra")
      }

      const data = await response.json()

      // Limpiar carrito
      localStorage.removeItem("cart")

      // Redirigir a página de confirmación
      router.push(`/checkout/confirmacion?ticketId=${data.ticketId}`)
    } catch (error: any) {
      console.error("Error al procesar la compra:", error)
      setError(error.message || "Error al procesar la compra")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      {/* Formulario de pago */}
      <div className="md:col-span-8">
        <Card>
          <CardHeader>
            <CardTitle>Información de Pago</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="payment-method">Método de Pago</Label>
                <RadioGroup
                  id="payment-method"
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="payment-cash" />
                    <Label htmlFor="payment-cash" className="flex items-center">
                      <Banknote className="mr-2 h-4 w-4" />
                      Efectivo
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="payment-credit" />
                    <Label htmlFor="payment-credit" className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Tarjeta de crédito
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="payment-debit" />
                    <Label htmlFor="payment-debit" className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Tarjeta de débito
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {(paymentMethod === "2" || paymentMethod === "3") && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="card-number">Número de Tarjeta</Label>
                    <Input id="card-number" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Fecha de Expiración</Label>
                      <Input id="expiry" placeholder="MM/AA" />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="name">Nombre en la Tarjeta</Label>
                    <Input id="name" placeholder="Juan Pérez" />
                  </div>
                </div>
              )}

              {error && <div className="text-red-500">{error}</div>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading || cartItems.length === 0}>
                {loading ? "Procesando..." : "Completar Compra"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Resumen del pedido */}
      <div className="md:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Resumen del Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cartItems.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500">El carrito está vacío</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.codigo} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.nombre}</p>
                      <p className="text-sm text-gray-500">
                        {item.cantidad} x ${item.precio.toLocaleString()}
                      </p>
                    </div>
                    <p className="font-medium">${(item.precio * item.cantidad).toLocaleString()}</p>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold">
                  <p>Total</p>
                  <p>${total.toLocaleString()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
