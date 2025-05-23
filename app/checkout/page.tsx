"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  metodoPago: z.string({
    required_error: "Por favor seleccione un método de pago",
  }),
})

export default function CheckoutPage() {
  const [cart, setCart] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [metodosPago, setMetodosPago] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSessionChecked, setIsSessionChecked] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      metodoPago: "",
    },
  })

  useEffect(() => {
    // Verificar sesión
    const checkSession = async () => {
      try {
        const response = await fetch("/api/session")
        const data = await response.json()

        if (!data.session) {
          toast({
            title: "Inicio de sesión requerido",
            description: "Debe iniciar sesión para completar la compra",
            variant: "destructive",
          })
          router.push("/login?redirectTo=/checkout")
          return
        }

        // Si el usuario no es cliente, redirigir
        if (data.session.role !== "cliente") {
          toast({
            title: "Acceso denegado",
            description: "Solo los clientes pueden realizar compras",
            variant: "destructive",
          })
          router.push("/unauthorized?message=Solo los clientes pueden realizar compras")
          return
        }

        setIsSessionChecked(true)
      } catch (error) {
        console.error("Error al verificar sesión:", error)
        toast({
          title: "Error",
          description: "Ocurrió un error al verificar su sesión",
          variant: "destructive",
        })
        router.push("/login")
      }
    }

    checkSession()
  }, [router, toast])

  useEffect(() => {
    if (!isSessionChecked) return

    // Cargar el carrito desde localStorage
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart)
      setCart(parsedCart)

      // Calcular el total
      const totalPrice = parsedCart.reduce((sum: number, item: any) => sum + item.precio * item.quantity, 0)
      setTotal(totalPrice)
    }

    // Cargar métodos de pago
    const fetchMetodosPago = async () => {
      try {
        const response = await fetch("/api/metodos-pago")
        if (response.ok) {
          const data = await response.json()
          setMetodosPago(data)
        } else {
          console.error("Error al cargar métodos de pago")
        }
      } catch (error) {
        console.error("Error:", error)
      }
    }

    fetchMetodosPago()
  }, [isSessionChecked])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    try {
      // Obtener la sesión del usuario actual
      const response = await fetch("/api/session")
      const sessionData = await response.json()

      if (!sessionData.session) {
        toast({
          title: "Error",
          description: "Debe iniciar sesión para completar la compra",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      // Crear ticket de venta
      const ventaResponse = await fetch("/api/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clienteId: sessionData.session.id,
          metodoPago: values.metodoPago,
          items: cart,
          total: total,
        }),
      })

      if (!ventaResponse.ok) {
        throw new Error("Error al procesar la venta")
      }

      const ventaData = await ventaResponse.json()

      // Limpiar carrito
      localStorage.removeItem("cart")

      toast({
        title: "Compra completada",
        description: "Su compra ha sido procesada con éxito",
      })

      // Redirigir a página de confirmación
      router.push(`/checkout/confirmacion?id=${ventaData.ticketId}`)
    } catch (error) {
      console.error("Error en el proceso de checkout:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar su compra",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSessionChecked) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <div className="animate-pulse">Verificando sesión...</div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Carrito vacío</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No hay productos en su carrito</p>
            <Button className="mt-4" onClick={() => router.push("/productos")}>
              Ir a productos
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Finalizar Compra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Resumen de compra</h3>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.codigo} className="flex justify-between">
                  <span>
                    {item.nombre} x {item.quantity}
                  </span>
                  <span>S/. {(item.precio * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>S/. {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="metodoPago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pago</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un método de pago" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {metodosPago.map((metodo) => (
                          <SelectItem key={metodo.ID} value={metodo.ID.toString()}>
                            {metodo["Metodo de pago"]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Procesando..." : "Completar Compra"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
