import { getClients } from "@/app/actions/cajero"
import { getAvailableProducts } from "@/app/actions/cajero"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, ShoppingCart, ShoppingBag } from "lucide-react"

export default async function CajeroDashboard() {
  const { clients, error: clientsError } = await getClients()
  const { products, error: productsError } = await getAvailableProducts()

  const clientCount = clients ? clients.length : 0
  const productCount = products ? products.length : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Cajero</h1>
        <p className="text-muted-foreground">Bienvenido al panel de cajero de Tech-Y</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Disponibles</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Clientes</CardTitle>
            <CardDescription>Administra los clientes de la tienda</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/cajero/clientes">
              <Button className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Gestionar Clientes
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carrito de Compras</CardTitle>
            <CardDescription>Crea una nueva venta</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/cajero/carrito">
              <Button className="w-full">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Ir al Carrito
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Ventas</CardTitle>
            <CardDescription>Visualiza las ventas realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/cajero/ventas">
              <Button className="w-full">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Ver Ventas
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
