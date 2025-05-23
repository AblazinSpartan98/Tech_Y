"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ShoppingBag, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ClientePurchasesPageProps {
  params: {
    id: string
  }
}

interface Cliente {
  ID: string
  Nombre: string
  "Apellido Paterno": string
  "Apellido Materno": string
}

interface Compra {
  ID: number
  Fecha: string
  Total: number
  Metodo_Pago: string
}

export default function ClientePurchasesPage({ params }: ClientePurchasesPageProps) {
  const id = params.id
  const router = useRouter()
  const { toast } = useToast()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [compras, setCompras] = useState<Compra[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch client info
        const clienteResponse = await fetch(`/api/clientes/${id}`)
        if (!clienteResponse.ok) {
          throw new Error("No se pudo cargar la información del cliente")
        }
        const clienteData = await clienteResponse.json()
        setCliente(clienteData)

        // Fetch client purchases
        const comprasResponse = await fetch(`/api/clientes/${id}/compras`)
        if (!comprasResponse.ok) {
          throw new Error("No se pudieron cargar las compras del cliente")
        }
        const comprasData = await comprasResponse.json()
        setCompras(comprasData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información",
          variant: "destructive",
        })
        router.push("/admin/clientes")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, router, toast])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p>Cargando información...</p>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p>Cliente no encontrado</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Compras del Cliente</h1>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nombre</p>
              <p>
                {cliente.Nombre} {cliente["Apellido Paterno"]} {cliente["Apellido Materno"]}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ID</p>
              <p>{cliente.ID}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Historial de Compras
          </CardTitle>
        </CardHeader>
        <CardContent>
          {compras.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">ID</th>
                    <th className="text-left py-3 px-4">Fecha</th>
                    <th className="text-right py-3 px-4">Total</th>
                    <th className="text-left py-3 px-4">Método de Pago</th>
                    <th className="text-right py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {compras.map((compra) => (
                    <tr key={compra.ID} className="border-b">
                      <td className="py-3 px-4">{compra.ID}</td>
                      <td className="py-3 px-4">{new Date(compra.Fecha).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">${compra.Total.toFixed(2)}</td>
                      <td className="py-3 px-4">{compra.Metodo_Pago}</td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/admin/tickets/${compra.ID}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No hay compras registradas</h3>
              <p className="mt-1 text-gray-500">Este cliente no ha realizado compras aún.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
