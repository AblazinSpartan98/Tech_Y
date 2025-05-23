"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CartItem {
  codigo: string
  nombre: string
  precio: number
  cantidad: number
  subtotal: number
  imagen: string
}

interface Cliente {
  ID: number
  Nombre: string
  "Apellido Paterno": string
}

interface MetodoPago {
  ID: number
  "Metodo de pago": string
}

export default function CarritoPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [clienteId, setClienteId] = useState("")
  const [metodoPago, setMetodoPago] = useState("")
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Cargar el carrito desde localStorage
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart)

        // Transformar el formato del carrito
        const formattedCart = parsedCart.map((item: any) => ({
          codigo: item.codigo,
          nombre: item.nombre,
          precio: item.precio,
          cantidad: item.quantity,
          subtotal: item.precio * item.quantity,
          imagen: item.imagen || "/placeholder.svg?height=48&width=48",
        }))

        setCartItems(formattedCart)

        // Calcular el total
        const totalPrice = formattedCart.reduce((sum: number, item: any) => sum + item.subtotal, 0)
        setTotal(totalPrice)
      } catch (error) {
        console.error("Error parsing cart:", error)
      }
    }

    setIsLoading(false)

    // Cargar métodos de pago
    fetchMetodosPago()

    // Cargar clientes
    fetchClientes()
  }, [])

  const fetchMetodosPago = async () => {
    try {
      const response = await fetch("/api/metodos-pago")
      if (response.ok) {
        const data = await response.json()
        setMetodosPago(data || [])
        if (data && data.length > 0) {
          setMetodoPago(data[0].ID.toString())
        }
      } else {
        console.error("Error al cargar métodos de pago")
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const fetchClientes = async () => {
    try {
      const response = await fetch("/api/clientes")
      if (response.ok) {
        const data = await response.json()
        setClientes(data || [])
        if (data && data.length > 0) {
          setClienteId(data[0].ID.toString())
        }
      } else {
        console.error("Error al cargar clientes")
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const updateQuantity = (codigo: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(codigo)
      return
    }

    const updatedCart = cartItems.map((item) =>
      item.codigo === codigo ? { ...item, cantidad, subtotal: item.precio * cantidad } : item,
    )

    setCartItems(updatedCart)

    // Actualizar el total
    const newTotal = updatedCart.reduce((sum, item) => sum + item.subtotal, 0)
    setTotal(newTotal)

    // Actualizar localStorage
    const storageFormat = updatedCart.map((item) => ({
      codigo: item.codigo,
      nombre: item.nombre,
      precio: item.precio,
      quantity: item.cantidad,
      imagen: item.imagen,
    }))

    localStorage.setItem("cart", JSON.stringify(storageFormat))
  }

  const removeItem = (codigo: string) => {
    const updatedCart = cartItems.filter((item) => item.codigo !== codigo)
    setCartItems(updatedCart)

    // Actualizar el total
    const newTotal = updatedCart.reduce((sum, item) => sum + item.subtotal, 0)
    setTotal(newTotal)

    // Actualizar localStorage
    const storageFormat = updatedCart.map((item) => ({
      codigo: item.codigo,
      nombre: item.nombre,
      precio: item.precio,
      quantity: item.cantidad,
      imagen: item.imagen,
    }))

    localStorage.setItem("cart", JSON.stringify(storageFormat))

    toast({
      title: "Producto eliminado",
      description: "El producto ha sido eliminado del carrito",
    })
  }

  const handleCheckout = async () => {
    if (!clienteId) {
      toast({
        title: "Error",
        description: "Por favor, seleccione un cliente",
        variant: "destructive",
      })
      return
    }

    if (!metodoPago) {
      toast({
        title: "Error",
        description: "Por favor, seleccione un método de pago",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch("/api/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clienteId,
          metodoPago,
          items: cartItems.map((item) => ({
            codigo: item.codigo,
            quantity: item.cantidad,
            precio: item.precio,
          })),
          total,
        }),
      })

      if (response.ok) {
        // Limpiar carrito
        localStorage.removeItem("cart")

        // Mostrar diálogo de éxito
        setShowSuccessDialog(true)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "No se pudo procesar la venta",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error processing checkout:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la venta",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false)
    router.push("/cajero")
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Carrito de Compras</h1>

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-40">
            <p className="text-lg text-gray-500">El carrito está vacío</p>
            <Button className="mt-4" onClick={() => router.push("/productos")}>
              Ver Productos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.codigo}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="relative h-12 w-12">
                              <Image
                                src={item.imagen || "/placeholder.svg?height=48&width=48"}
                                alt={item.nombre}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                            <span className="font-medium">{item.nombre}</span>
                          </div>
                        </TableCell>
                        <TableCell>${item.precio.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.codigo, item.cantidad - 1)}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{item.cantidad}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.codigo, item.cantidad + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>${item.subtotal.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => removeItem(item.codigo)}>
                            Eliminar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cliente</label>
                  <Select value={clienteId} onValueChange={setClienteId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(clientes) &&
                        clientes.map((cliente) => (
                          <SelectItem key={cliente.ID} value={cliente.ID.toString()}>
                            {cliente.Nombre} {cliente["Apellido Paterno"]}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Método de Pago</label>
                  <Select value={metodoPago} onValueChange={setMetodoPago}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(metodosPago) &&
                        metodosPago.map((metodo) => (
                          <SelectItem key={metodo.ID} value={metodo.ID.toString()}>
                            {metodo["Metodo de pago"]}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between pt-4 font-semibold text-lg">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleCheckout} disabled={isProcessing || cartItems.length === 0}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Finalizar Compra"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {/* Diálogo de éxito */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¡Compra realizada con éxito!</DialogTitle>
            <DialogDescription>La venta ha sido procesada correctamente.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCloseSuccessDialog}>Aceptar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
