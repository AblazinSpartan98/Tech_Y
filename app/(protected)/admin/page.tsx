import { getEmployees } from "@/app/actions/admin"
import { getAllProducts } from "@/app/actions/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Package, Database, Clipboard } from "lucide-react"

export default async function AdminDashboard() {
  const { employees, error: employeesError } = await getEmployees()
  const { products, error: productsError } = await getAllProducts()

  const employeeCount = employees ? employees.length : 0
  const productCount = products ? products.length : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administrador</h1>
        <p className="text-muted-foreground">Bienvenido al panel de administración de Tech-Y</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeCount}</div>
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
            <CardTitle>Gestión de Empleados</CardTitle>
            <CardDescription>Administra los empleados de la tienda</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/empleados">
              <Button className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Gestionar Empleados
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
            <Link href="/admin/productos">
              <Button className="w-full">
                <Package className="mr-2 h-4 w-4" />
                Gestionar Productos
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ver Tablas</CardTitle>
            <CardDescription>Visualiza todas las tablas del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/tablas">
              <Button className="w-full">
                <Database className="mr-2 h-4 w-4" />
                Ver Tablas
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tickets de Venta</CardTitle>
            <CardDescription>Visualiza los tickets de venta de clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/tickets">
              <Button className="w-full">
                <Clipboard className="mr-2 h-4 w-4" />
                Ver Tickets
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
