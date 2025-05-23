import { getProviders } from "@/app/actions/bodegero"
import { getProductsForPurchase } from "@/app/actions/bodegero"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package, Warehouse } from "lucide-react"

export default async function BodegeroDashboard() {
  const { providers, error: providersError } = await getProviders()
  const { products, error: productsError } = await getProductsForPurchase()

  const providerCount = providers ? providers.length : 0
  const productCount = products ? products.length : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Bodegero</h1>
        <p className="text-muted-foreground">Bienvenido al panel de bodegero de Tech-Y</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proveedores</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{providerCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Compras</CardTitle>
            <CardDescription>Administra las compras a proveedores</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/bodegero/compras">
              <Button className="w-full">
                <Warehouse className="mr-2 h-4 w-4" />
                Gestionar Compras
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestión de Productos</CardTitle>
            <CardDescription>Administra el inventario de productos</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/bodegero/productos">
              <Button className="w-full">
                <Package className="mr-2 h-4 w-4" />
                Gestionar Productos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
